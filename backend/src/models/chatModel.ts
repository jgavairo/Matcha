import { pool } from '../config/database';

export interface Conversation {
    id: number;
    match_id: number;
    user1_id: number;
    user2_id: number;
    user1_username: string;
    user2_username: string;
    last_message: string;
    last_message_date: Date;
    unread_count: number;
}

export interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    content: string;
    is_read: boolean;
    created_at: Date;
}

export const createConversation = async (matchId: number) => {
    const query = `
        INSERT INTO conversations (match_id)
        VALUES ($1)
        RETURNING *
    `;
    const values = [matchId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const createMessage = async (conversationId: number, senderId: number, content: string) => {
    const query = `
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const values = [conversationId, senderId, content];
    const result = await pool.query(query, values);
    
    // Update conversation updated_at
    await pool.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
    
    return result.rows[0];
};

export const getConversations = async (userId: number) => {
    const query = `
        SELECT 
            c.id, 
            c.match_id,
            m.user_id_1,
            m.user_id_2,
            u1.username as user1_username,
            u2.username as user2_username,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_date,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND is_read = FALSE) as unread_count
        FROM conversations c
        JOIN matches m ON c.match_id = m.id
        JOIN users u1 ON m.user_id_1 = u1.id
        JOIN users u2 ON m.user_id_2 = u2.id
        WHERE m.user_id_1 = $1 OR m.user_id_2 = $1
        ORDER BY c.updated_at DESC
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows;
};

export const getMessages = async (conversationId: number, userId: number) => {
    // Verify user is part of the conversation (via match)
    const authQuery = `
        SELECT 1 
        FROM conversations c
        JOIN matches m ON c.match_id = m.id
        WHERE c.id = $1 AND (m.user_id_1 = $2 OR m.user_id_2 = $2)
    `;
    const authResult = await pool.query(authQuery, [conversationId, userId]);
    if (authResult.rows.length === 0) {
        throw new Error('Unauthorized');
    }

    const query = `
        SELECT * FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
    `;
    const values = [conversationId];
    const result = await pool.query(query, values);
    return result.rows;
};

export const markMessagesAsRead = async (conversationId: number, userId: number) => {
    const query = `
        UPDATE messages
        SET is_read = TRUE
        WHERE conversation_id = $1 AND sender_id != $2
    `;
    const values = [conversationId, userId];
    await pool.query(query, values);
};
