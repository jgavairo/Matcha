import { api } from '../../../services/api';

export interface Conversation {
    id: number;
    match_id: number;
    user1_id: number;
    user2_id: number;
    user1_username: string;
    user2_username: string;
    user1_is_online: boolean;
    user2_is_online: boolean;
    user1_last_connection: string;
    user2_last_connection: string;
    last_message: string;
    last_message_date: string;
    unread_count: number;
    is_archived?: boolean;
    is_active: boolean;
}

export interface Message {
    id: number;
    conversation_id: number;
    sender_id: number | null;
    content: string;
    is_read: boolean;
    created_at: string;
    type?: 'text' | 'image' | 'audio' | 'system';
}

export const chatService = {
    getConversations: async (): Promise<Conversation[]> => {
        const response = await api.get('/chat/conversations');
        return response.data;
    },

    getMessages: async (conversationId: number): Promise<Message[]> => {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`);
        return response.data;
    },

    sendMessage: async (conversationId: number, content: string): Promise<Message> => {
        const response = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
        return response.data;
    },
    uploadFiles: async (files: File[]): Promise<string[]> => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        const response = await api.post('/chat/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.urls;
    },
    markAsRead: async (conversationId: number): Promise<void> => {
        await api.post(`/chat/conversations/${conversationId}/read`);
    },

    // For testing
    createMatch: async (targetUserId: number): Promise<void> => {
        await api.post('/chat/matches', { targetUserId });
    },

    archiveConversation: async (conversationId: number): Promise<void> => {
        // await api.post(`/chat/conversations/${conversationId}/archive`);
        console.log('Archived conversation', conversationId);
    },

    unarchiveConversation: async (conversationId: number): Promise<void> => {
        // await api.post(`/chat/conversations/${conversationId}/unarchive`);
        console.log('Unarchived conversation', conversationId);
    }
};
