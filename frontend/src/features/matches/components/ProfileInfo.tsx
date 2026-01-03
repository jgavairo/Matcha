import React from 'react';
import { Badge } from 'flowbite-react';
import { HiLocationMarker, HiStar, HiClock, HiHeart, HiX } from 'react-icons/hi';
import { UserProfile } from '@app-types/user';
import { getSexualOrientationLabel } from '../../../utils/userUtils';
import ImageCarousel from './ImageCarousel';
import ActionButton from '../../../components/ui/ActionButton';

interface ProfileInfoProps {
  user: UserProfile;
  onLike: () => void;
  onDislike: () => void;
  showPassButton?: boolean;
  hideActions?: boolean;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user, onLike, onDislike, showPassButton = false, hideActions = false }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col gap-6">
        {/* Images */}
        <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg flex-shrink-0 relative group">
          <ImageCarousel images={user.images.slice(0, 5)} alt={user.username} />
          
          {/* Action Buttons - Bottom Right */}
          {!hideActions && (
            <div className="absolute bottom-4 right-4 flex gap-3 z-card-ui">
              {showPassButton && (
                <ActionButton 
                    size="lg"
                    onClick={onDislike}
                    className="bg-white/80 hover:bg-gray-200 text-gray-700 shadow-lg backdrop-blur-sm border-none"
                    title="Pass"
                >
                    <HiX className="w-6 h-6" /> 
                </ActionButton>
              )}
              
              <ActionButton 
                  variant="primary"
                  size="lg"
                  onClick={onLike}
                  className={`shadow-lg backdrop-blur-sm border-none transition-all duration-300 ${
                      user.isMatch 
                      ? 'bg-pink-500 text-white hover:bg-pink-600' 
                      : 'bg-white/80 text-pink-500 hover:bg-pink-500 hover:text-white'
                  }`}
                  title={user.isMatch ? "Unlike" : "Like"}
              >
                  <HiHeart className="w-6 h-6" />
              </ActionButton>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {/* Header Info */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {user.firstName} {user.lastName}
                <span className="text-xl font-normal text-gray-500">, {user.age}</span>
              </h2>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                <HiLocationMarker className="w-4 h-4 mr-1" />
                {user.distance === 0 ? "less than 1" : user.distance} km away
              </div>
              <div className="flex items-center text-yellow-500 mt-1">
                <HiStar className="w-4 h-4 mr-1" />
                {user.fameRating} Fame Rating
              </div>
              {!user.isOnline && (
                <div className="flex items-center text-gray-400 text-sm mt-1">
                  <HiClock className="w-4 h-4 mr-1" />
                  Last seen: {user.lastConnection}
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-col gap-2 items-end">
              {user.isMatch && (
                <Badge color="purple" size="sm" icon={HiHeart}>It's a Match!</Badge>
              )}
              {user.hasLikedYou && !user.isMatch && (
                <Badge color="pink" size="sm" icon={HiHeart}>Likes You</Badge>
              )}
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">About</h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{user.biography}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</h4>
                <p className="text-gray-900 dark:text-white capitalize">{user.gender}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Orientation</h4>
                <p className="text-gray-900 dark:text-white capitalize">
                  {getSexualOrientationLabel(user.gender, user.sexualPreferences)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.tags.map((tag, index) => (
                  <Badge key={index} color="indigo" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
