import { pool } from '../config/database';

export const createMatch = async (userId1: number, userId2: number) => {

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create Match
        const matchQuery = `
            INSERT INTO matches (user_id_1, user_id_2)
            VALUES ($1, $2)
            RETURNING *
        `;
        // Ensure smaller ID is first to avoid duplicates in a consistent way if we enforced it, 
        // but here we just insert. Ideally we check if it exists.
        const matchResult = await client.query(matchQuery, [userId1, userId2]);
        const match = matchResult.rows[0];

        // Create Conversation
        const convQuery = `
            INSERT INTO conversations (match_id)
            VALUES ($1)
            RETURNING *
        `;
        const convResult = await client.query(convQuery, [match.id]);
        const conversation = convResult.rows[0];

        // Create Automatic First Message
        const msgQuery = `
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        // Assuming userId2 is the one who "completed" the match, or just pick one.
        // The prompt says "Chaque personnes avec qui on a matche sera automatiquement en conversation avec nous avec un premier message automatique."
        // Let's say the system sends it, or one of the users. 
        // If it's "automatic", maybe it's a system message? But the schema has sender_id REFERENCES users.
        // Let's make the "other" user send the message to "us".
        // Since we don't know who is "us" in this context (it's symmetric), let's just have userId2 send it to userId1.
        const welcomeMessage = "It's a match! You can now chat.";
        await client.query(msgQuery, [conversation.id, userId2, welcomeMessage]);

        await client.query('COMMIT');
        return match;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};
