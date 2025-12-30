import React from 'react';
import { UserSummary } from '@app-types/user';
import { Avatar, Button } from 'flowbite-react';

interface UserListProps {
    users: UserSummary[];
    title: string;
    actionLabel?: string;
    onAction?: (user: UserSummary) => void;
}

const UserList: React.FC<UserListProps> = ({ users, title, actionLabel, onAction }) => {
    if (users.length === 0) return null;

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="space-y-3">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <Avatar img={user.images[0]} rounded />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                                <p className="text-sm text-gray-500">{user.age} years old</p>
                            </div>
                        </div>
                        {actionLabel && onAction && (
                            <Button size="xs" color="gray" onClick={() => onAction(user)}>
                                {actionLabel}
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserList;
