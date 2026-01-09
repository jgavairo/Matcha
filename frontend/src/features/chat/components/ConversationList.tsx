import React, { useState } from 'react';
import { Conversation } from '../services/chatService';
import { Badge, Tooltip } from 'flowbite-react';
import { HiArchive, HiInbox } from 'react-icons/hi';
import UserProfileModal from '@features/matches/components/UserProfileDrawer';
import { UserProfile } from '@app-types/user';
import { api } from '@services/api';
import { useNotification } from '@context/NotificationContext';

interface ConversationListProps {
    conversations: Conversation[];
    currentUserId: number;
    onSelectConversation: (conversation: Conversation) => void;
    onArchiveConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, currentUserId, onSelectConversation, onArchiveConversation }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const { addToast } = useNotification();

    const filteredConversations = conversations.filter(c => {
        if (activeTab === 'archived') {
            return c.is_archived;
        }
        // For 'all' and 'unread', exclude archived
        if (c.is_archived) return false;

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

    const handleProfileClick = async (e: React.MouseEvent, userId: number) => {
        e.stopPropagation(); // Empêcher la sélection de la conversation
        try {
            const response = await api.get(`/users/${userId}`);
            const data = response.data;
            
            // Transformer les données de l'API pour correspondre à l'interface UserProfile
            const fullProfile: UserProfile = {
                id: data.id,
                username: data.username,
                firstName: data.first_name,
                lastName: data.last_name,
                age: data.age,
                gender: data.gender,
                biography: data.biography || '',
                tags: data.tags || [],
                fameRating: data.fame_rating || 0,
                distance: data.distance || 0,
                isOnline: false,
                lastConnection: new Date().toISOString(),
                images: data.images || [],
                location: {
                    city: data.city || '',
                    latitude: data.latitude || 0,
                    longitude: data.longitude || 0
                },
                sexualPreferences: data.sexual_preferences || [],
                birthDate: data.birth_date,
                hasLikedYou: data.has_liked_you || false,
                isLiked: data.is_liked || false,
                isMatch: data.is_match || false
            };

            setSelectedUser(fullProfile);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            addToast("Failed to load user profile", 'error');
        }
    };

    const handleBlock = async () => {
        if (selectedUser) {
            try {
                await api.post('/block', { blockedId: selectedUser.id });
                addToast('User blocked successfully', 'success');
                setSelectedUser(null);
            } catch (error: any) {
                addToast((error.response?.data?.error || 'Failed to block user'), 'error');
            }
        }
    };

    const handleReport = async (reasons: string[]) => {
        if (selectedUser) {
            try {
                await api.post('/report', { reportedId: selectedUser.id, reasons });
                addToast('User reported successfully', 'success');
                setSelectedUser(null);
            } catch (error: any) {
                addToast((error.response?.data?.error || 'Failed to report user'), 'error');
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                        activeTab === 'all'
                            ? 'text-pink-600 border-b-2 border-pink-600 dark:text-pink-500 dark:border-pink-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('all')}
                >
                    All
                </button>
                <button
                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                        activeTab === 'unread'
                            ? 'text-pink-600 border-b-2 border-pink-600 dark:text-pink-500 dark:border-pink-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('unread')}
                >
                    Unread
                </button>
                <button
                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                        activeTab === 'archived'
                            ? 'text-pink-600 border-b-2 border-pink-600 dark:text-pink-500 dark:border-pink-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('archived')}
                >
                    Archived
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        {activeTab === 'all' ? 'No conversations yet.' : 
                         activeTab === 'unread' ? 'No unread messages.' : 
                         'No archived conversations.'}
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredConversations.map((conversation) => {
                            const otherUsername = conversation.user1_id === currentUserId ? conversation.user2_username : conversation.user1_username;
                            // Use profile photo if available, otherwise fallback to generated avatar
                            const otherUserImage = conversation.user1_id === currentUserId ? conversation.user2_image : conversation.user1_image;
                            const avatarUrl = otherUserImage || `https://ui-avatars.com/api/?name=${otherUsername}&background=random`;

                            return (
                                <li 
                                    key={conversation.id} 
                                    onClick={() => onSelectConversation(conversation)}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group relative"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0 relative">
                                            <img 
                                                src={avatarUrl} 
                                                alt={otherUsername}
                                                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all"
                                                onClick={(e) => {
                                                    const otherUserId = conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id;
                                                    handleProfileClick(e, otherUserId);
                                                }}
                                            />
                                            {conversation.unread_count > 0 && (
                                                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></span>
                                            )}
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
                                            <p className="text-sm text-gray-500 truncate dark:text-gray-400 pr-8">
                                                {conversation.last_message || 'Start a conversation'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Archive Action */}
                                    <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Tooltip content={conversation.is_archived ? "Unarchive" : "Archive"}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onArchiveConversation(conversation);
                                                }}
                                                className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-500"
                                            >
                                                {conversation.is_archived ? <HiInbox className="w-5 h-5" /> : <HiArchive className="w-5 h-5" />}
                                            </button>
                                        </Tooltip>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* User Profile Modal */}
            <UserProfileModal
                user={selectedUser}
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                onLike={() => {}} // Pas de like/dislike dans une conversation (déjà match)
                onDislike={() => {}}
                onBlock={handleBlock}
                onReport={handleReport}
                hideActions={false}
            />
        </div>
    );
};

export default ConversationList;
