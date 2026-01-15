import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@context/AuthContext';
import { useSocket } from '@context/SocketContext';
import { useChatContext } from '@context/ChatContext';
import { chatService, Conversation, Message } from '../services/chatService';

export const useChat = () => {
    const { user } = useAuth();
    const { socketService } = useSocket();
    const { setActiveChatUserId } = useChatContext();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const currentUserId = user?.id || null;

    const loadConversations = useCallback(async () => {
        // Even if no user, we might want to stop loading? 
        // But if we are not logged in, the page redirects usually (protected route).
        if (!currentUserId) return;
        
        try {
            const data = await chatService.getConversations();
            const normalizedData = data.map(conv => ({
                ...conv,
                unread_count: Number(conv.unread_count) || 0
            }));
            setConversations(normalizedData);
        } catch (error) {
            // Error already handled by UI
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    // Initial load
    useEffect(() => {
        if (currentUserId) {
            loadConversations();
        }
    }, [currentUserId, loadConversations]);

    // Set active chat user context
    useEffect(() => {
        if (selectedConversation && currentUserId) {
            const otherUserId = selectedConversation.user1_id === currentUserId 
                ? selectedConversation.user2_id 
                : selectedConversation.user1_id;
            setActiveChatUserId(otherUserId);
        } else {
            setActiveChatUserId(null);
        }
        
        return () => setActiveChatUserId(null);
    }, [selectedConversation, currentUserId, setActiveChatUserId]);

    // Socket listeners
    useEffect(() => {
        if (!currentUserId) return;

        const handleMessage = (msg: Message) => {
            setConversations(prev => {
                const index = prev.findIndex(c => c.id === msg.conversation_id);
                if (index === -1) {
                    loadConversations();
                    return prev;
                }

                const updatedConversations = [...prev];
                const conversation = updatedConversations[index];
                
                const currentUnreadCount = Number(conversation.unread_count) || 0;
                
                updatedConversations[index] = {
                    ...conversation,
                    last_message: msg.content,
                    last_message_date: msg.created_at,
                    unread_count: (selectedConversation?.id === conversation.id) ? currentUnreadCount : currentUnreadCount + 1
                };

                updatedConversations.sort((a, b) => new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime());

                return updatedConversations;
            });
        };

        const handleMessagesRead = ({ conversationId, readerId }: { conversationId: number, readerId: number }) => {
            if (readerId === currentUserId) {
                setConversations(prev => prev.map(c => 
                    c.id === conversationId 
                        ? { ...c, unread_count: 0 } 
                        : c
                ));
            }
        };

        const handleStatusUpdate = ({ conversationId, is_active }: { conversationId: number, is_active: boolean }) => {
            setConversations(prev => prev.map(c => 
                c.id === conversationId 
                    ? { ...c, is_active } 
                    : c
            ));
            
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation(prev => prev ? { ...prev, is_active } : null);
            }
        };

        socketService.on('chat_message', handleMessage);
        socketService.on('messages_read', handleMessagesRead);
        socketService.on('conversation_status_update', handleStatusUpdate);

        return () => {
            socketService.off('chat_message', handleMessage);
            socketService.off('messages_read', handleMessagesRead);
            socketService.off('conversation_status_update', handleStatusUpdate);
        };
    }, [selectedConversation, socketService, currentUserId, loadConversations]);

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedConversation(null);
        loadConversations();
    };

    const handleArchiveConversation = async (conversation: Conversation) => {
        try {
            if (conversation.is_archived) {
                await chatService.unarchiveConversation(conversation.id);
            } else {
                await chatService.archiveConversation(conversation.id);
            }
            
            setConversations(prev => prev.map(c => 
                c.id === conversation.id 
                    ? { ...c, is_archived: !c.is_archived } 
                    : c
            ));
        } catch (error) {
            // Error already handled by UI
        }
    };

    return {
        conversations,
        selectedConversation,
        isDrawerOpen,
        currentUserId,
        loading,
        handleSelectConversation,
        handleCloseDrawer,
        handleArchiveConversation
    };
};
