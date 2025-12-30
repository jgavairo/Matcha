import React from 'react';
import { HiX, HiHeart, HiRefresh } from 'react-icons/hi';
import { UserProfile } from '@app-types/user';
import ActionButton from '@ui/ActionButton';
import Badge from '@ui/Badge';
import UserInfoOverlay from './UserInfoOverlay';

interface UserCardProps {
  user: UserProfile;
  onLike: () => void;
  onDislike: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onOpenProfile: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onLike, onDislike, onUndo, canUndo, onOpenProfile }) => {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div
        className="relative flex-grow min-h-0 w-full cursor-pointer group overflow-hidden"
        onClick={onOpenProfile}
      >
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

      <div className="p-5 flex-shrink-0">
        <p
          className="mb-3 font-normal text-gray-700 dark:text-gray-400 line-clamp-3 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
          onClick={onOpenProfile}
        >
          {user.biography}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {user.tags.map((tag, index) => (
            <Badge key={index}>
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex justify-center items-center gap-6 mt-4">
          <ActionButton
            variant="warning"
            size="lg"
            onClick={(e) => { e.stopPropagation(); onUndo(); }}
            disabled={!canUndo}
            title="Undo last action"
          >
            <HiRefresh className="w-5 h-5" />
          </ActionButton>

          <ActionButton
            variant="danger"
            size="xl"
            onClick={(e) => { e.stopPropagation(); onDislike(); }}
          >
            <HiX className="w-8 h-8" />
          </ActionButton>

          <ActionButton
            variant="primary"
            size="xl"
            onClick={(e) => { e.stopPropagation(); onLike(); }}
          >
            <HiHeart className="w-8 h-8" />
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
