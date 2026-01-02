import React from 'react';
import { HiX, HiHeart, HiLocationMarker, HiStar } from 'react-icons/hi';
import { UserProfile } from '@app-types/user';
import ActionButton from '@ui/ActionButton';

interface UserCardProps {
  user: UserProfile;
  onLike: () => void;
  onDislike: () => void;
  onOpenProfile: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onLike, onDislike, onOpenProfile }) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-white rounded-2xl shadow-xl dark:bg-gray-800 group">
      {/* Full Height Image */}
      <div
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={onOpenProfile}
      >
        <img
          src={user.images[0]}
          alt={user.username}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient Overlay - Stronger at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent/20 to-black/90" />
      </div>

      {/* Content Container - Positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end z-card-content pointer-events-none h-full">
        
        {/* User Info Section */}
        <div className="mt-auto mb-6 pointer-events-auto cursor-pointer transition-transform duration-300 group-hover:-translate-y-2" onClick={onOpenProfile}>
          <div className="flex items-end justify-between mb-1">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">
              {user.firstName}, {user.age}
            </h2>
            <div className="flex items-center text-yellow-400 mb-1 drop-shadow-md bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                <HiStar className="w-4 h-4 mr-1" />
                <span className="text-sm font-bold">{user.fameRating}</span>
            </div>
          </div>

          <div className="flex items-center text-gray-200 mb-3 drop-shadow-md">
            <HiLocationMarker className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">
              {user.distance > 0 ? `${user.distance} km away` : "Less than 1 km away"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-8 pointer-events-auto pb-2">
          <ActionButton
            variant="danger"
            size="xl"
            className="bg-black/40 backdrop-blur-md border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 scale-100 hover:scale-110 shadow-lg"
            onClick={(e) => { e.stopPropagation(); onDislike(); }}
          >
            <HiX className="w-8 h-8" />
          </ActionButton>

          <ActionButton
            variant="primary"
            size="xl"
            className="bg-black/40 backdrop-blur-md border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all duration-300 scale-100 hover:scale-110 shadow-lg"
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
