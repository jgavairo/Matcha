import React from 'react';
import { UserSummary } from '@app-types/user';
import { Button } from 'flowbite-react';
import { HiLocationMarker, HiStar } from 'react-icons/hi';
import { resolveImageUrl } from '@utils/userUtils';

interface UserListProps {
    users: UserSummary[];
    title: string;
    actionLabel?: string;
    onAction?: (user: UserSummary) => void;
    onUserClick?: (user: UserSummary) => void;
    emptyMessage?: string;
}

const UserList: React.FC<UserListProps> = ({ users, title, actionLabel, onAction, onUserClick, emptyMessage = "No users found." }) => {
    if (users.length === 0) {
        return (
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 italic">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        <div
                            className={`aspect-[3/4] relative overflow-hidden ${onUserClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onUserClick && onUserClick(user)}
                        >
                            <img
                                src={resolveImageUrl(user.images[0])}
                                alt={user.username}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                            {user.isOnline && (
                                <div className="absolute top-2 right-2">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                <div className="font-bold text-lg leading-tight">{user.username}, {user.age}</div>
                                <div className="flex items-center text-xs text-gray-300 mt-1">
                                    <HiLocationMarker className="w-3 h-3 mr-1" />
                                    {user.distance} km
                                </div>
                                <div className="flex items-center text-xs text-yellow-400 mt-0.5">
                                    <HiStar className="w-3 h-3 mr-1" />
                                    {user.fameRating}
                                </div>
                            </div>
                        </div>

                        {actionLabel && onAction && (
                            <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <Button
                                    size="xs"
                                    color="gray"
                                    className="w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction(user);
                                    }}
                                >
                                    {actionLabel}
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserList;
