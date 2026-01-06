import { pool } from '../config/database';
import { db } from '../utils/db';
import { PoolClient } from 'pg';

export const createMatch = async (userId1: number, userId2: number) => {
    // Legacy support or specific forceful creation
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const match = await activateMatch(userId1, userId2, client);
        await client.query('COMMIT');
        return match.match; // Return just the match to be compatible with previous signature logic essentially
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

export const activateMatch = async (userId1: number, userId2: number, client: any) => {
    // 1. Create match or update if exists (reactivate)
    // Using simple logic regarding ID ordering to ensure uniqueness if needed, 
    // but schema likely handles (user_id_1, user_id_2) uniqueness.
    // Assuming liker/liked logic passed correct IDs or we invoke this with min/max
    const u1 = Math.min(userId1, userId2);
    const u2 = Math.max(userId1, userId2);

    const matchQuery = `
        INSERT INTO matches (user_id_1, user_id_2, is_active) 
        VALUES ($1, $2, TRUE)
        ON CONFLICT (user_id_1, user_id_2) DO UPDATE SET is_active = TRUE, updated_at = NOW()
        RETURNING id
    `;
    const matchRes = await db.query(matchQuery, [u1, u2], { client });
    const matchId = matchRes.rows[0].id;

    // 2. Check/Create Conversation
    let conversationId;
    const existingConv = await db.query('SELECT id FROM conversations WHERE match_id = $1', [matchId], { client });
    
    if (existingConv.rowCount && existingConv.rowCount > 0) {
        conversationId = existingConv.rows[0].id;
    } else {
        const conv = await db.insert('conversations', { match_id: matchId }, { client });
        conversationId = conv.id;
    }

    // 3. Send System Message
    // The "triggering" user for the message is usually the one who just liked, 
    // but here we are in a shared context. We'll set sender_id to NULL for System Message if that's supported
    // OR set it to one of the users. The original likeUser code used NULL for sender in some cases or didn't specify?
    // In likeUser: "INSERT INTO matches ... VALUES ... TRUE". 
    // Wait, in likeUser original code: "INSERT INTO messages ... sender_id, content ... VALUES (..., NULL, ...)" -> sender_id is NULL.
    // So the system supports NULL sender_id (system message).
    
    // Check if we should send a message (only if match was just created or reactivated?)
    // The original code sends it every time the match condition is met.
    const systemMessage = "It's a match! You can now chat.";
    const message = await db.insert('messages', {
        conversation_id: conversationId,
        sender_id: null, // System message
        content: systemMessage
    }, { client });

    return { 
        match: { id: matchId, user_id_1: u1, user_id_2: u2 }, 
        conversationId, 
        message 
    };
};

export const deactivateMatch = async (userId1: number, userId2: number, client: any) => {
    const u1 = Math.min(userId1, userId2);
    const u2 = Math.max(userId1, userId2);

    // Deactivate match
    const matchRes = await db.query(`
        UPDATE matches 
        SET is_active = FALSE, updated_at = NOW()
        WHERE user_id_1 = $1 AND user_id_2 = $2
        RETURNING id
    `, [u1, u2], { client });

    if (matchRes.rowCount && matchRes.rowCount > 0) {
        const matchId = matchRes.rows[0].id;
        
        // Get conversation
        const convRes = await db.query('SELECT id FROM conversations WHERE match_id = $1', [matchId], { client });

        if (convRes.rowCount && convRes.rowCount > 0) {
            const conversationId = convRes.rows[0].id;
            const systemMessage = "User has left the chat.";
            const message = await db.insert('messages', {
                conversation_id: conversationId,
                sender_id: null,
                content: systemMessage
            }, { client });
            
            return { message, conversationId };
        }
    }
    return null;
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
            ) as fame_rating,
            (
                ROUND(
                    6371 * acos(
                        LEAST(1.0, GREATEST(-1.0, 
                            cos(radians(u.latitude)) * cos(radians((SELECT latitude FROM users WHERE id = $1))) * 
                            cos(radians((SELECT longitude FROM users WHERE id = $1)) - radians(u.longitude)) + 
                            sin(radians(u.latitude)) * sin(radians((SELECT latitude FROM users WHERE id = $1)))
                        ))
                    )
                )
            ) as distance
        FROM matches m
        JOIN users u ON (CASE WHEN m.user_id_1 = $1 THEN m.user_id_2 ELSE m.user_id_1 END) = u.id
        LEFT JOIN genders g ON u.gender_id = g.id
        LEFT JOIN user_interests ui ON u.id = ui.user_id
        LEFT JOIN interests t ON ui.interest_id = t.id
        WHERE m.user_id_1 = $1 OR m.user_id_2 = $1
        GROUP BY u.id, g.gender
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

export const getMatchedUserIds = async (userId: number): Promise<number[]> => {
    const query = `
        SELECT 
            CASE 
                WHEN user_id_1 = $1 THEN user_id_2 
                ELSE user_id_1 
            END as partner_id
        FROM matches 
        WHERE (user_id_1 = $1 OR user_id_2 = $1) AND is_active = TRUE
    `;
    const result = await db.query(query, [userId]);
    return result.rows.map((row: any) => row.partner_id);
};
