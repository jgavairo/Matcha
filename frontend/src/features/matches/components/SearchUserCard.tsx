import React from 'react';
import { UserProfile } from '@app-types/user';
import Badge from '@ui/Badge';
import UserInfoOverlay from './UserInfoOverlay';

interface SearchUserCardProps {
  user: UserProfile;
  onOpenProfile: () => void;
}

const SearchUserCard: React.FC<SearchUserCardProps> = ({ user, onOpenProfile }) => {
  return (
    <div
      className="flex flex-col w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onOpenProfile}
    >
      <div className="relative aspect-[3/4] w-full group overflow-hidden">
        <img
          src={user.images[0]}
          alt={user.username}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <UserInfoOverlay
          username={user.username}
          age={user.age}
          distance={user.distance}
          fameRating={user.fameRating}
        />
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {user.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} size="sm">
              {tag}
            </Badge>
          ))}
          {user.tags.length > 3 && (
            <Badge size="sm">+{user.tags.length - 3}</Badge>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-auto">
          {user.biography}
        </p>
      </div>
    </div>
  );
};

export default SearchUserCard;
