import React, { useEffect, useState } from 'react';
import ConversationList from '../features/chat/components/ConversationList';
import ChatDrawer from '../features/chat/components/ChatDrawer';
import { chatService, Conversation } from '../features/chat/services/chatService';
import authService from '../features/auth/services/authService';

const ChatPage: React.FC = () => {

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

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

    const loadConversations = async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data);
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

    // For testing: Simulate a match
    const handleSimulateMatch = async () => {
        const targetId = prompt("Enter User ID to match with:");
        if (targetId) {
            try {
                await chatService.createMatch(parseInt(targetId));
                alert("Match created! Conversation should appear.");
                loadConversations();
            } catch (e) {
                alert("Failed to create match (maybe already matched?)");
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!currentUserId) return <div className="p-10 text-center">Please log in.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
                <button 
                    onClick={handleSimulateMatch}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                >
                    Simulate Match (Test)
                </button>
            </div>

            <ConversationList 
                conversations={conversations} 
                currentUserId={currentUserId} 
                onSelectConversation={handleSelectConversation} 
            />

            <ChatDrawer 
                conversation={selectedConversation} 
                currentUserId={currentUserId} 
                isOpen={isDrawerOpen} 
                onClose={handleCloseDrawer} 
            />
        </div>
    );
};


export default ChatPage;
