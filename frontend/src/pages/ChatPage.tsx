import React, { useEffect, useState } from 'react';
import ConversationList from '@features/chat/components/ConversationList';
import ChatDrawer from '@features/chat/components/ChatDrawer';
import ChatWindow from '@features/chat/components/ChatWindow';
import { chatService, Conversation, Message } from '@features/chat/services/chatService';
import authService from '@features/auth/services/authService';
import { useSocket } from '@context/SocketContext';
import { useChatContext } from '@context/ChatContext';

const ChatPage: React.FC = () => {

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const { socketService } = useSocket();
    const { setActiveChatUserId } = useChatContext();

    // Update active chat context when selected conversation changes
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

    useEffect(() => {
        const init = async () => {
            try {
                const user = await authService.checkAuth();
                setCurrentUserId(user.id);
                await loadConversations();
            } catch (error) {
                console.error('Failed to initialize chat page', error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        const handleMessage = (msg: Message) => {
            setConversations(prev => {
                const index = prev.findIndex(c => c.id === msg.conversation_id);
                if (index === -1) {
                    loadConversations();
                    return prev;
                }

                const updatedConversations = [...prev];
                const conversation = updatedConversations[index];
                
                // S'assurer que unread_count est un nombre
                const currentUnreadCount = Number(conversation.unread_count) || 0;
                
                updatedConversations[index] = {
                    ...conversation,
                    last_message: msg.content,
                    last_message_date: msg.created_at,
                    unread_count: (selectedConversation?.id === conversation.id) ? currentUnreadCount : currentUnreadCount + 1
                };

                // Move to top
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
    }, [selectedConversation, socketService, currentUserId]);

    const loadConversations = async () => {
        try {
            const data = await chatService.getConversations();
            // S'assurer que unread_count est toujours un nombre
            const normalizedData = data.map(conv => ({
                ...conv,
                unread_count: Number(conv.unread_count) || 0
            }));
            setConversations(normalizedData);
        } catch (error) {
            console.error('Failed to load conversations', error);
        }
    };

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedConversation(null);
        loadConversations(); // Refresh to update unread counts/last message
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
            console.error('Failed to archive conversation', error);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!currentUserId) return <div className="p-10 text-center">Please log in.</div>;

    return (
        <div className="flex-1 flex flex-col w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
            <div className="w-full flex flex-grow overflow-hidden">
                {/* Left Column: Conversation List */}
                <div className="w-full md:w-1/3 flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-700">
                    <div className="flex-1 min-h-0">
                        <ConversationList 
                            conversations={conversations} 
                            currentUserId={currentUserId} 
                            onSelectConversation={handleSelectConversation} 
                            onArchiveConversation={handleArchiveConversation}
                        />
                    </div>
                </div>

                {/* Right Column: Chat Window (Desktop only) */}
                <div className="hidden md:block md:w-2/3 h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
                    <ChatWindow 
                        conversation={selectedConversation} 
                        currentUserId={currentUserId} 
                        className="h-full"
                    />
                </div>
            </div>

            {/* Mobile Drawer */}
            <div className="md:hidden">
                <ChatDrawer 
                    conversation={selectedConversation} 
                    currentUserId={currentUserId} 
                    isOpen={isDrawerOpen} 
                    onClose={handleCloseDrawer} 
                />
            </div>
        </div>
    );
};


export default ChatPage;
