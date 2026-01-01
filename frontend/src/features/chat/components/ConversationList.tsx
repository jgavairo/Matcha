import React from 'react';
import { Conversation } from '../services/chatService';

interface ConversationListProps {
    conversations: Conversation[];
    currentUserId: number;
    onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, currentUserId, onSelectConversation }) => {
    return (
        <div className="flex flex-col space-y-2 p-4">
            {conversations.map((conversation) => {
                const otherUsername = conversation.user1_id === currentUserId ? conversation.user2_username : conversation.user1_username;
                
                return (
                    <div 
                        key={conversation.id} 
                        onClick={() => onSelectConversation(conversation)}
                        className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg">{otherUsername}</h3>
                            {conversation.unread_count > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {conversation.unread_count}
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-gray-600 text-sm truncate max-w-[200px]">
                                {conversation.last_message || 'No messages yet'}
                            </p>
                            <span className="text-gray-400 text-xs">
                                {conversation.last_message_date ? new Date(conversation.last_message_date).toLocaleDateString() : ''}
                            </span>
                        </div>
                    </div>
                );
            })}
            {conversations.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                    No conversations yet. Match with someone to start chatting!
                </div>
            )}
        </div>
    );
};

export default ConversationList;
