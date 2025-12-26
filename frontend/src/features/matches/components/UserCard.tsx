import React from 'react';
import { HiX, HiHeart, HiLocationMarker, HiStar, HiRefresh } from 'react-icons/hi';
import { UserSummary } from '../../../types/user';
import ImageCarousel from './ImageCarousel';
import ActionButton from '../../../components/ui/ActionButton';
import Badge from '../../../components/ui/Badge';

interface UserCardProps {
  user: UserSummary;
  onLike: () => void;
  onDislike: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onLike, onDislike, onUndo, canUndo }) => {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="relative flex-grow min-h-0 w-full">
        <ImageCarousel images={user.images} alt={user.username} />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 pointer-events-none z-10">
          <h5 className="text-2xl font-bold tracking-tight text-white">
            {user.username}, {user.age}
          </h5>
          <div className="flex items-center text-gray-300 mt-1">
            <HiLocationMarker className="w-4 h-4 mr-1" />
            <span className="text-sm">{user.distance} km away</span>
          </div>
          <div className="flex items-center text-yellow-400 mt-1">
            <HiStar className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium text-white">{user.fameRating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex-shrink-0">
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400 line-clamp-3">
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
