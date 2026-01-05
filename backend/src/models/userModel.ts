import { LoginFormData, RegisterFormData } from '../types/forms';
import { pool } from '../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const createUser = async (user: RegisterFormData) => {
    const query = `
    INSERT INTO users (email, username, first_name, last_name, birth_date, password, verification_token)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `;
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const verificationToken = uuidv4();
    const values = [user.email, user.username, user.firstName, user.lastName, user.birthDate, hashedPassword, verificationToken];
    try {
        const result = await pool.query(query, values);
        return { id: result.rows[0].id, email: user.email, verificationToken: verificationToken };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const loginUser = async (user: LoginFormData) => {
    try {
    const query = `
    SELECT id, username, password, status_id FROM users WHERE username = $1
    `;
        const values = [user.username];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            console.error('Invalid username');
            return null;
        }
        const isValidPassword = await bcrypt.compare(user.password, result.rows[0].password);
        if (!isValidPassword) {
            console.error('Invalid password');
            return null;
        }
        if (result.rows[0].status_id == 0) {
            console.error('User not verified');
            return { id: result.rows[0].id, status: 'not_verified' };
        }
        return { id: result.rows[0].id };
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
};

export const updateUser = async (id: number, data: any) => {
    const { username, firstName, lastName, email, gender, sexualPreferences, biography, latitude, longitude, city, birthDate } = data;
    
    // Map gender string to ID
    const genderMap: { [key: string]: number } = { 'male': 1, 'female': 2, 'other': 3 };
    const genderId = genderMap[gender] || null;

    // Map sexual preferences string to IDs array
    let targetGenderIds: number[] = [];
    
    if (Array.isArray(sexualPreferences)) {
        targetGenderIds = sexualPreferences.map((pref: string) => genderMap[pref]).filter((id: number) => id);
    } else if (gender === 'male') {
        if (sexualPreferences === 'hetero') targetGenderIds = [2];
        else if (sexualPreferences === 'homo') targetGenderIds = [1];
        else if (sexualPreferences === 'bi') targetGenderIds = [1, 2];
    } else if (gender === 'female') {
        if (sexualPreferences === 'hetero') targetGenderIds = [1];
        else if (sexualPreferences === 'homo') targetGenderIds = [2];
        else if (sexualPreferences === 'bi') targetGenderIds = [1, 2];
    } else {
        // For 'other', let's assume bi for now or handle differently
        targetGenderIds = [1, 2, 3];
    }

    const query = `
        UPDATE users 
        SET username = $1, first_name = $2, last_name = $3, email = $4, gender_id = $5, sexual_preferences = $6, biography = $7, latitude = $8, longitude = $9, city = $10, birth_date = $11
        WHERE id = $12
        RETURNING *
    `;
    const values = [username, firstName, lastName, email, genderId, targetGenderIds, biography, latitude, longitude, city, birthDate, id];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const updateUserInterests = async (userId: number, tags: string[]) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Remove existing interests
        await client.query('DELETE FROM user_interests WHERE user_id = $1', [userId]);

        // 2. Add new interests
        // First ensure tags exist in interests table (optional, but good for consistency)
        // For now, assuming tags come from the predefined list which exists.
        
        // Get IDs for the tags
        if (tags.length > 0) {
            const tagQuery = `SELECT id FROM interests WHERE name = ANY($1)`;
            const tagResult = await client.query(tagQuery, [tags]);
            const tagIds = tagResult.rows.map(row => row.id);

            // Insert into user_interests
            if (tagIds.length > 0) {
                const values = tagIds.map((tagId, index) => `($1, $${index + 2})`).join(',');
                const insertQuery = `INSERT INTO user_interests (user_id, interest_id) VALUES ${values}`;
                await client.query(insertQuery, [userId, ...tagIds]);
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const updatePassword = async (userId: number, newPassword: string) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    await pool.query(query, [hashedPassword, userId]);
};

export const addImage = async (userId: number, filename: string) => {
    const url = `http://localhost:5000/uploads/${filename}`;
    const query = 'INSERT INTO images (user_id, url, is_profile_picture) VALUES ($1, $2, (SELECT COUNT(*) = 0 FROM images WHERE user_id = $1)) RETURNING *';
    const result = await pool.query(query, [userId, url]);
    return result.rows[0];
};

export const removeImage = async (userId: number, url: string) => {
    const query = 'DELETE FROM images WHERE user_id = $1 AND url = $2';
    await pool.query(query, [userId, url]);
};

export const setProfileImage = async (userId: number, url: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE images SET is_profile_picture = FALSE WHERE user_id = $1', [userId]);
        await client.query('UPDATE images SET is_profile_picture = TRUE WHERE user_id = $1 AND url = $2', [userId, url]);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const getUserById = async (id: number, currentUserId?: number) => {
    const query = `
        SELECT 
            u.id, u.email, u.username, u.first_name, u.last_name, u.birth_date, u.biography, u.status_id,
            u.latitude, u.longitude, u.city, u.geolocation_consent,
            EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
            g.gender,
            (
                SELECT COALESCE(array_agg(g2.gender), '{}')
                FROM unnest(u.sexual_preferences) as pref_id
                JOIN genders g2 ON g2.id = pref_id
            ) as sexual_preferences,
            (
                SELECT COALESCE(array_agg(url ORDER BY is_profile_picture DESC, created_at ASC), '{}')
                FROM images 
                WHERE user_id = u.id
            ) as images,
            COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags,
            -- Fame rating
            (
                (SELECT COUNT(*) FROM likes WHERE liked_id = u.id) * 5 +
                (SELECT COUNT(*) FROM views WHERE viewed_id = u.id)
            ) as fame_rating
            ${currentUserId ? `,
            -- Interaction flags
            EXISTS (
                SELECT 1 FROM likes WHERE liker_id = u.id AND liked_id = $2
            ) as has_liked_you,
            EXISTS (
                SELECT 1 FROM likes WHERE liker_id = $2 AND liked_id = u.id
            ) as is_liked,
            EXISTS (
                SELECT 1 FROM matches WHERE (user_id_1 = u.id AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = u.id)
            ) as is_match
            ` : ''}
        FROM users u
        LEFT JOIN genders g ON u.gender_id = g.id
        LEFT JOIN user_interests ui ON u.id = ui.user_id
        LEFT JOIN interests t ON ui.interest_id = t.id
        WHERE u.id = $1
        GROUP BY u.id, g.gender
    `;
    const values = currentUserId ? [id, currentUserId] : [id];
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error getting user by id:', error);
        throw error;
    }
};

export const getUserByEmail = async (email: string) => {
    const query = 'SELECT id FROM users WHERE email = $1';
    const values = [email];
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
};

export const updateGeolocationConsent = async (userId: number, consent: boolean) => {
    const query = 'UPDATE users SET geolocation_consent = $1 WHERE id = $2';
    await pool.query(query, [consent, userId]);
};

export const searchUsers = async (currentUserId: number, filters: any, page: number, limit: number) => {
    const { 
        ageRange, 
        distanceRange, 
        fameRange, 
        minCommonTags, 
        tags, 
        gender,
        sexualPreference,
        location, 
        locationCoords, 
        sortBy, 
        sortOrder,
        includeInteracted
    } = filters;
    const offset = (page - 1) * limit;

    // Get current user location and tags for distance and common tags calculation
    const currentUserResult = await pool.query(
        `SELECT 
            u.latitude, 
            u.longitude, 
            u.gender_id, 
            u.sexual_preferences,
            COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags
        FROM users u
        LEFT JOIN user_interests ui ON u.id = ui.user_id
        LEFT JOIN interests t ON ui.interest_id = t.id
        WHERE u.id = $1
        GROUP BY u.id`,
        [currentUserId]
    );
    const currentUser = currentUserResult.rows[0];
    if (!currentUser) throw new Error('User not found');

    // Determine center for distance calculation
    let centerLat = currentUser.latitude || 0;
    let centerLon = currentUser.longitude || 0;

    if (locationCoords && locationCoords.latitude && locationCoords.longitude) {
        centerLat = locationCoords.latitude;
        centerLon = locationCoords.longitude;
    }

    const userTags = currentUser.tags || [];
    const myGenderId = currentUser.gender_id;
    // If my prefs are empty, I am bisexual (interested in all)
    const myPrefs = (!currentUser.sexual_preferences || currentUser.sexual_preferences.length === 0) 
        ? [1, 2, 3] 
        : currentUser.sexual_preferences;

    // Base query
    let query = `
        WITH user_data AS (
            SELECT 
                u.id, u.username, u.first_name, u.last_name, u.birth_date, u.biography,
                u.latitude, u.longitude, u.city,
                (
                    SELECT COALESCE(array_agg(g2.gender), '{}')
                    FROM unnest(u.sexual_preferences) as pref_id
                    JOIN genders g2 ON g2.id = pref_id
                ) as sexual_preferences,
                EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
                g.gender,
                (
                    SELECT url 
                    FROM images 
                    WHERE user_id = u.id AND is_profile_picture = TRUE 
                    LIMIT 1
                ) as profile_picture,
                COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags,
                -- Calculate distance (Haversine formula)
                (
                    6371 * acos(
                        LEAST(GREATEST(
                        cos(radians($1)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians($2)) +
                        sin(radians($1)) * sin(radians(u.latitude))
                        , -1.0), 1.0)
                    )
                ) as distance,
                -- Calculate common tags count
                (
                    SELECT COUNT(*)
                    FROM user_interests ui2
                    JOIN interests i2 ON ui2.interest_id = i2.id
                    WHERE ui2.user_id = u.id AND i2.name = ANY($3)
                ) as common_tags_count,
                -- Check if user has liked current user
                EXISTS (
                    SELECT 1 FROM likes WHERE liker_id = u.id AND liked_id = $4
                ) as has_liked_you,
                -- Check if they are a match
                EXISTS (
                    SELECT 1 FROM matches WHERE (user_id_1 = u.id AND user_id_2 = $4) OR (user_id_1 = $4 AND user_id_2 = u.id)
                ) as is_match,
                -- Fame rating (likes * 5 + views)
                (
                    (SELECT COUNT(*) FROM likes WHERE liked_id = u.id) * 5 +
                    (SELECT COUNT(*) FROM views WHERE viewed_id = u.id)
                ) as fame_rating
            FROM users u
            LEFT JOIN genders g ON u.gender_id = g.id
            LEFT JOIN user_interests ui ON u.id = ui.user_id
            LEFT JOIN interests t ON ui.interest_id = t.id
            WHERE u.id != $4 -- Exclude current user
            ${!includeInteracted ? `
            -- Exclude users already liked or disliked
            AND NOT EXISTS (
                SELECT 1 FROM likes WHERE liker_id = $4 AND liked_id = u.id
            )
            AND NOT EXISTS (
                SELECT 1 FROM dislikes WHERE disliker_id = $4 AND disliked_id = u.id
            )
            ` : ''}
            -- 1. Target gender must be in my preferences
            AND u.gender_id = ANY($5)
            -- 2. My gender must be in target's preferences (or target has no prefs = bisexual)
            AND (
                cardinality(u.sexual_preferences) = 0 
                OR 
                $6 = ANY(u.sexual_preferences)
            )
            GROUP BY u.id, g.gender
        )
        SELECT *, count(*) OVER() as total_count
        FROM user_data
        WHERE 1=1
    `;

    const values: any[] = [centerLat, centerLon, userTags, currentUserId, myPrefs, myGenderId];
    let paramIndex = 7;

    // Apply filters
    if (ageRange) {
        query += ` AND age BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        values.push(ageRange[0], ageRange[1]);
        paramIndex += 2;
    }

    if (distanceRange) {
        query += ` AND distance BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        values.push(distanceRange[0], distanceRange[1]);
        paramIndex += 2;
    }

    if (fameRange) {
        query += ` AND fame_rating BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        values.push(fameRange[0], fameRange[1]);
        paramIndex += 2;
    }

    if (minCommonTags > 0) {
        query += ` AND common_tags_count >= $${paramIndex}`;
        values.push(minCommonTags);
        paramIndex++;
    }

    if (tags && tags.length > 0) {
        // Filter by specific tags if provided (must have at least one of the tags)
        query += ` AND tags && $${paramIndex}`;
        values.push(tags);
        paramIndex++;
    }

    if (gender && gender.length > 0) {
        query += ` AND gender = ANY($${paramIndex})`;
        values.push(gender);
        paramIndex++;
    }

    if (sexualPreference && sexualPreference.length > 0) {
         query += ` AND sexual_preferences @> $${paramIndex}`;
         values.push(sexualPreference);
         paramIndex++;
    }
    
    if (location && !locationCoords) {
        query += ` AND city ILIKE $${paramIndex}`;
        values.push(`%${location}%`);
        paramIndex++;
    }

    // Sorting
    const sortColumn = sortBy === 'age' ? 'age' : 
                       sortBy === 'fameRating' ? 'fame_rating' : 
                       sortBy === 'commonTags' ? 'common_tags_count' : 'distance';
    
    query += ` ORDER BY ${sortColumn} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;

    // Pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    try {
        const result = await pool.query(query, values);
        
        return {
            users: result.rows,
            total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0
        };
    } catch (error) {
        console.error('Error searching users:', error);
        throw error;
    }
};

export const recordView = async (viewerId: number, viewedId: number) => {
    if (viewerId === viewedId) return;

    // Record view only if it doesn't exist (unique view per user pair)
    const query = `
        INSERT INTO views (viewer_id, viewed_id)
        SELECT $1, $2
        WHERE NOT EXISTS (
            SELECT 1 FROM views WHERE viewer_id = $1 AND viewed_id = $2
        )
    `;
    try {
        await pool.query(query, [viewerId, viewedId]);
    } catch (error) {
        console.error('Error recording view:', error);
    }
};

export const likeUser = async (likerId: number, likedId: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert like
        await client.query(`
            INSERT INTO likes (liker_id, liked_id) 
            VALUES ($1, $2) 
            ON CONFLICT (liker_id, liked_id) DO NOTHING
        `, [likerId, likedId]);

        // 2. Check for match
        const res = await client.query(`
            SELECT 1 FROM likes WHERE liker_id = $1 AND liked_id = $2
        `, [likedId, likerId]);

        let isMatch = false;
        if (res.rowCount && res.rowCount > 0) {
            isMatch = true;
            // Create match or update if exists (reactivate)
            await client.query(`
                INSERT INTO matches (user_id_1, user_id_2, is_active) 
                VALUES ($1, $2, TRUE)
                ON CONFLICT (user_id_1, user_id_2) DO UPDATE SET is_active = TRUE, updated_at = NOW()
            `, [Math.min(likerId, likedId), Math.max(likerId, likedId)]);
            
            // Get match ID
            const matchRes = await client.query(`
                SELECT id FROM matches WHERE user_id_1 = $1 AND user_id_2 = $2
            `, [Math.min(likerId, likedId), Math.max(likerId, likedId)]);

            const matchId = matchRes.rows[0].id;

            // Check if conversation exists
            let conversationId;
            const existingConv = await client.query(`
                SELECT id FROM conversations WHERE match_id = $1
            `, [matchId]);

            if (existingConv.rowCount && existingConv.rowCount > 0) {
                conversationId = existingConv.rows[0].id;
            } else {
                const convRes = await client.query(`
                    INSERT INTO conversations (match_id)
                    VALUES ($1)
                    RETURNING id
                `, [matchId]);
                conversationId = convRes.rows[0].id;
            }

            // Send system message
            const systemMessage = "It's a match! You can now chat.";
            const msgRes = await client.query(`
                INSERT INTO messages (conversation_id, sender_id, content)
                VALUES ($1, NULL, $2)
                RETURNING *
            `, [conversationId, systemMessage]);

            const message = msgRes.rows[0];

            await client.query('COMMIT');
            return { isMatch, message, conversationId };
        }

        // 3. Remove from dislikes if exists (in case of change of mind)
        await client.query(`
            DELETE FROM dislikes WHERE disliker_id = $1 AND disliked_id = $2
        `, [likerId, likedId]);

        await client.query('COMMIT');
        return { isMatch };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const dislikeUser = async (dislikerId: number, dislikedId: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert dislike
        await client.query(`
            INSERT INTO dislikes (disliker_id, disliked_id) 
            VALUES ($1, $2)
            ON CONFLICT (disliker_id, disliked_id) DO NOTHING
        `, [dislikerId, dislikedId]);

        // 2. Remove like if exists
        await client.query(`
            DELETE FROM likes WHERE liker_id = $1 AND liked_id = $2
        `, [dislikerId, dislikedId]);

        // 3. Deactivate match if exists
        const matchRes = await client.query(`
            UPDATE matches 
            SET is_active = FALSE, updated_at = NOW()
            WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)
            RETURNING id
        `, [dislikerId, dislikedId]);

        if (matchRes.rowCount && matchRes.rowCount > 0) {
            const matchId = matchRes.rows[0].id;
            
            // Get conversation
            const convRes = await client.query(`
                SELECT id FROM conversations WHERE match_id = $1
            `, [matchId]);

            if (convRes.rowCount && convRes.rowCount > 0) {
                const conversationId = convRes.rows[0].id;
                const systemMessage = "User has left the chat.";
                const msgRes = await client.query(`
                    INSERT INTO messages (conversation_id, sender_id, content)
                    VALUES ($1, NULL, $2)
                    RETURNING *
                `, [conversationId, systemMessage]);
                
                await client.query('COMMIT');
                return { message: msgRes.rows[0], conversationId };
            }
        }

        await client.query('COMMIT');
        return {};
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const unlikeUser = async (likerId: number, likedId: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Remove like
        await client.query(`
            DELETE FROM likes WHERE liker_id = $1 AND liked_id = $2
        `, [likerId, likedId]);

        // 2. Deactivate match if exists
        const matchRes = await client.query(`
            UPDATE matches 
            SET is_active = FALSE, updated_at = NOW()
            WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)
            RETURNING id
        `, [likerId, likedId]);

        if (matchRes.rowCount && matchRes.rowCount > 0) {
            const matchId = matchRes.rows[0].id;
            
            // Get conversation
            const convRes = await client.query(`
                SELECT id FROM conversations WHERE match_id = $1
            `, [matchId]);

            if (convRes.rowCount && convRes.rowCount > 0) {
                const conversationId = convRes.rows[0].id;
                const systemMessage = "User has left the chat.";
                const msgRes = await client.query(`
                    INSERT INTO messages (conversation_id, sender_id, content)
                    VALUES ($1, NULL, $2)
                    RETURNING *
                `, [conversationId, systemMessage]);
                
                await client.query('COMMIT');
                return { message: msgRes.rows[0], conversationId };
            }
        }

        await client.query('COMMIT');
        return {};
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const getLikedByUsers = async (userId: number) => {
    const query = `
        SELECT 
            u.id, u.username, u.first_name, u.last_name, u.birth_date, u.biography,
            u.latitude, u.longitude, u.city,
            EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
            g.gender,
            (
                SELECT COALESCE(array_agg(url ORDER BY is_profile_picture DESC, created_at ASC), '{}')
                FROM images 
                WHERE user_id = u.id
            ) as images,
            COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags,
            (
                (SELECT COUNT(*) FROM likes WHERE liked_id = u.id) * 5 +
                (SELECT COUNT(*) FROM views WHERE viewed_id = u.id)
            ) as fame_rating
        FROM likes l
        JOIN users u ON l.liker_id = u.id
        LEFT JOIN genders g ON u.gender_id = g.id
        LEFT JOIN user_interests ui ON u.id = ui.user_id
        LEFT JOIN interests t ON ui.interest_id = t.id
        WHERE l.liked_id = $1
        GROUP BY u.id, g.gender
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

export const getViewedByUsers = async (userId: number) => {
    const query = `
        SELECT 
            u.id, u.username, u.first_name, u.last_name, u.birth_date, u.biography,
            u.latitude, u.longitude, u.city,
            EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
            g.gender,
            (
                SELECT COALESCE(array_agg(url ORDER BY is_profile_picture DESC, created_at ASC), '{}')
                FROM images 
                WHERE user_id = u.id
            ) as images,
            COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags,
            (
                (SELECT COUNT(*) FROM likes WHERE liked_id = u.id) * 5 +
                (SELECT COUNT(*) FROM views WHERE viewed_id = u.id)
            ) as fame_rating
        FROM views v
        JOIN users u ON v.viewer_id = u.id
        LEFT JOIN genders g ON u.gender_id = g.id
        LEFT JOIN user_interests ui ON u.id = ui.user_id
        LEFT JOIN interests t ON ui.interest_id = t.id
        WHERE v.viewed_id = $1
        GROUP BY u.id, g.gender
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

export const getMatchedUsers = async (userId: number) => {
    const query = `
        SELECT 
            u.id, u.username, u.first_name, u.last_name, u.birth_date, u.biography,
            u.latitude, u.longitude, u.city,
            EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
            g.gender,
            (
                SELECT COALESCE(array_agg(url ORDER BY is_profile_picture DESC, created_at ASC), '{}')
                FROM images 
                WHERE user_id = u.id
            ) as images,
            COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags,
            (
                (SELECT COUNT(*) FROM likes WHERE liked_id = u.id) * 5 +
                (SELECT COUNT(*) FROM views WHERE viewed_id = u.id)
            ) as fame_rating
        FROM matches m
        JOIN users u ON (CASE WHEN m.user_id_1 = $1 THEN m.user_id_2 ELSE m.user_id_1 END) = u.id
        LEFT JOIN genders g ON u.gender_id = g.id
        LEFT JOIN user_interests ui ON u.id = ui.user_id
        LEFT JOIN interests t ON ui.interest_id = t.id
        WHERE m.user_id_1 = $1 OR m.user_id_2 = $1
        GROUP BY u.id, g.gender
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

export const getUserByVerificationToken = async (token: string) => {
    const query = `
    SELECT id, email, status_id FROM users WHERE verification_token = $1
    `;
    const values = [token];
    try {
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            console.error('User not found');
            return null;
        }
        return { id: result.rows[0].id, email: result.rows[0].email, status: result.rows[0].status_id };
    } catch (error) {
        console.error('Error getting user by verification token:', error);
        throw error;
    }
};

export const updateUserStatus = async (userId: number, status: number) => {
    const query = `
    UPDATE users SET status_id = $2 WHERE id = $1
    `;
    const values = [userId, status];
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};