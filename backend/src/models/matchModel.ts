import { pool } from '../config/database';
import { db } from '../utils/db';

export const createMatch = async (userId1: number, userId2: number) => {

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create Match
        const match = await db.insert('matches', { user_id_1: userId1, user_id_2: userId2 }, { client });

        // Create Conversation
        const conversation = await db.insert('conversations', { match_id: match.id }, { client });

        // Create Automatic First Message
        // Assuming userId2 is the one who "completed" the match
        const welcomeMessage = "It's a match! You can now chat.";
        await db.insert('messages', {
            conversation_id: conversation.id,
            sender_id: userId2,
            content: welcomeMessage
        }, { client });

        await client.query('COMMIT');
        return match;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};
