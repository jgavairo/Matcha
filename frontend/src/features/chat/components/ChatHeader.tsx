import React from 'react';
import { HiPhone, HiX } from 'react-icons/hi';
import { Conversation } from '../services/chatService';

interface ChatHeaderProps {
    conversation: Conversation;
    currentUserId: number;
    onCallUser: () => void;
    onClose?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, currentUserId, onCallUser, onClose }) => {
    const otherUsername = conversation.user1_id === currentUserId ? conversation.user2_username : conversation.user1_username;

    return (
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{otherUsername}</h2>
            <div className="flex items-center gap-4">
                {conversation.is_active && (
                    <button 
                        onClick={onCallUser}
                        className="p-2 text-green-600 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 dark:text-green-500 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        title="Start Video Call"
                    >
                        <HiPhone className="w-6 h-6" />
                    </button>
                )}
                {onClose && (
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden">
                        <HiX className="h-6 w-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChatHeader;
