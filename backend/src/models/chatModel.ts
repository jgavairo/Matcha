import { db } from '../utils/db';

export interface Conversation {
    id: number;
    match_id: number;
    user1_id: number;
    user2_id: number;
    user1_username: string;
    user2_username: string;
    user1_is_online: boolean;
    user2_is_online: boolean;
    user1_last_connection: Date;
    user2_last_connection: Date;
    last_message: string;
    last_message_date: Date;
    unread_count: number;
}

export interface Message {
    id: number;
    conversation_id: number;
    sender_id: number | null;
    content: string;
    type: 'text' | 'image' | 'audio' | 'system';
    is_read: boolean;
    created_at: Date;
}

export const createConversation = async (matchId: number) => {
    return await db.insert('conversations', { match_id: matchId });
};

export const createMessage = async (conversationId: number, senderId: number | null, content: string, type: 'text' | 'image' | 'audio' | 'system' = 'text') => {
    // Check if match is active
    const checkQuery = `
        SELECT m.is_active 
        FROM conversations c
        JOIN matches m ON c.match_id = m.id
        WHERE c.id = $1
    `;
    const checkRes = await db.query(checkQuery, [conversationId]);
    
    if (checkRes.rows.length === 0) {
         throw new Error('Conversation not found');
    }
    
    if (!checkRes.rows[0].is_active) {
        throw new Error('Conversation is not active');
    }

    const message = await db.insert('messages', {
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        type
    });
    
    // Update conversation updated_at
    await db.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
    
    return message;
};

export const getConversations = async (userId: number) => {
    const query = `
        SELECT 
            c.id, 
            c.match_id,
            m.user_id_1 as user1_id,
            m.user_id_2 as user2_id,
            m.is_active,
            u1.username as user1_username,
            u2.username as user2_username,
            u1.is_online as user1_is_online,
            u2.is_online as user2_is_online,
            u1.last_connection as user1_last_connection,
            u2.last_connection as user2_last_connection,
            (SELECT url FROM images WHERE user_id = u1.id ORDER BY is_profile_picture DESC, created_at ASC LIMIT 1) as user1_image,
            (SELECT url FROM images WHERE user_id = u2.id ORDER BY is_profile_picture DESC, created_at ASC LIMIT 1) as user2_image,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_date,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND (sender_id != $1 OR sender_id IS NULL) AND is_read = FALSE) as unread_count
        FROM conversations c
        JOIN matches m ON c.match_id = m.id
        JOIN users u1 ON m.user_id_1 = u1.id
        JOIN users u2 ON m.user_id_2 = u2.id
        WHERE m.user_id_1 = $1 OR m.user_id_2 = $1
        ORDER BY c.updated_at DESC
    `;
    const result = await db.query(query, [userId]);
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
    const authResult = await db.query(authQuery, [conversationId, userId]);
    if (authResult.rows.length === 0) {
        throw new Error('Unauthorized');
    }

    return await db.findAll('messages', { conversation_id: conversationId }, ['*'], 'created_at', 'ASC');
};

export const markMessagesAsRead = async (conversationId: number, userId: number) => {
    const query = `
        UPDATE messages
        SET is_read = TRUE
        WHERE conversation_id = $1 AND (sender_id != $2 OR sender_id IS NULL)
    `;
    await db.query(query, [conversationId, userId]);
};

export const getConversationParticipants = async (conversationId: number) => {
    const query = `
        SELECT m.user_id_1, m.user_id_2
        FROM conversations c
        JOIN matches m ON c.match_id = m.id
        WHERE c.id = $1
    `;
    const result = await db.query(query, [conversationId]);
    return result.rows[0];
};

export const getConversationIdByUsers = async (userId1: number, userId2: number) => {
    const query = `
        SELECT c.id 
        FROM conversations c
        JOIN matches m ON c.match_id = m.id
        WHERE (m.user_id_1 = $1 AND m.user_id_2 = $2) OR (m.user_id_1 = $2 AND m.user_id_2 = $1)
    `;
    const result = await db.query(query, [userId1, userId2]);
    return result.rows[0]?.id;
};
