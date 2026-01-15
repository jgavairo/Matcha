import React from 'react';
import ConversationList from '@features/chat/components/ConversationList';
import ChatDrawer from '@features/chat/components/ChatDrawer';
import ChatWindow from '@features/chat/components/ChatWindow';
import { useChat } from '@features/chat/hooks/useChat';

const ChatPage: React.FC = () => {
    const {
        conversations,
        selectedConversation,
        isDrawerOpen,
        currentUserId,
        loading,
        handleSelectConversation,
        handleCloseDrawer,
        handleArchiveConversation
    } = useChat();

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
