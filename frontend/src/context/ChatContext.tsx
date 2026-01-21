import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { chatService } from '../features/chat/services/chatService';

interface ChatContextType {
    activeChatUserId: number | null;
    setActiveChatUserId: (id: number | null) => void;
    unreadCount: number;
    refreshUnreadCount: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeChatUserId, setActiveChatUserId] = useState<number | null>(null);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const { socketService } = useSocket();
    const { isAuthenticated, user } = useAuth();

    const refreshUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const conversations = await chatService.getConversations();
            const count = conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
            setUnreadCount(count);
        } catch (error) {
        }
    }, [isAuthenticated]);

    // Initial fetch
    useEffect(() => {
        refreshUnreadCount();
    }, [refreshUnreadCount]);

    useEffect(() => {
        if (!socketService || !isAuthenticated) return;

        const handleNewMessage = (message: any) => {
            // If the message is from me, don't increment
            if (user && message.sender_id === user.id) return;
            
            // If we are currently chatting with this user, don't increment (assuming it's read immediately)
            // Ideally, the ChatPage handles marking as read.
            // But for simple badge logic:
            if (activeChatUserId && message.sender_id === activeChatUserId) {
                return; 
            }

            // Otherwise, simple increment (or refresh to be sure)
            // Refreshing is safer to sync with backend 'unread_count' logic
            refreshUnreadCount();
        };

        socketService.on('chat_message', handleNewMessage);

        return () => {
            socketService.off('chat_message', handleNewMessage);
        };
    }, [socketService, isAuthenticated, user, activeChatUserId, refreshUnreadCount]);

    return (
        <ChatContext.Provider value={{ activeChatUserId, setActiveChatUserId, unreadCount, refreshUnreadCount }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
