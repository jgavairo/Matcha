import React, { useState } from 'react';
import { Conversation } from '../services/chatService';
import { Avatar, Badge } from 'flowbite-react';

interface ConversationListProps {
    conversations: Conversation[];
    currentUserId: number;
    onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, currentUserId, onSelectConversation }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    const filteredConversations = conversations.filter(c => {
        if (activeTab === 'unread') {
            return c.unread_count > 0;
        }
        return true;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString();
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                        activeTab === 'all'
                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('all')}
                >
                    All
                </button>
                <button
                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                        activeTab === 'unread'
                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('unread')}
                >
                    Unread
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        {activeTab === 'all' ? 'No conversations yet.' : 'No unread messages.'}
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredConversations.map((conversation) => {
                            const otherUsername = conversation.user1_id === currentUserId ? conversation.user2_username : conversation.user1_username;
                            // Placeholder avatar since we don't have it in the Conversation type yet
                            const avatarUrl = `https://ui-avatars.com/api/?name=${otherUsername}&background=random`;

                            return (
                                <li 
                                    key={conversation.id} 
                                    onClick={() => onSelectConversation(conversation)}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <Avatar img={avatarUrl} rounded status={conversation.unread_count > 0 ? "online" : undefined} statusPosition="bottom-right" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                    {otherUsername}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(conversation.last_message_date)}
                                                    </span>
                                                    {conversation.unread_count > 0 && (
                                                        <Badge color="failure" className="rounded-full px-2">
                                                            {conversation.unread_count}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                                {conversation.last_message || 'Start a conversation'}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
