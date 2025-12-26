import React from 'react';
import { HiX, HiHeart } from 'react-icons/hi';
import ActionButton from '@ui/ActionButton';

interface ProfileFooterProps {
  onLike: () => void;
  onDislike: () => void;
}

const ProfileFooter: React.FC<ProfileFooterProps> = ({ onLike, onDislike }) => {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex justify-center items-center gap-6">
        <ActionButton 
          variant="danger" 
          size="xl" 
          onClick={onDislike}
        >
          <HiX className="w-8 h-8" />
        </ActionButton>

        <ActionButton 
          variant="primary" 
          size="xl" 
          onClick={onLike}
        >
          <HiHeart className="w-8 h-8" />
        </ActionButton>
      </div>
    </div>
  );
};

export default ProfileFooter;
