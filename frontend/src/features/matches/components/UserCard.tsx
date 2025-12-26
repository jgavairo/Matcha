import React from 'react';
import { HiX, HiHeart, HiLocationMarker } from 'react-icons/hi';
import { User } from '../../../types/user';
import { Badge } from 'flowbite-react';

interface UserCardProps {
  user: User;
  onLike: () => void;
  onDislike: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onLike, onDislike }) => {
  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      <div className="relative h-96 w-full">
        <img 
          className="absolute inset-0 w-full h-full object-cover" 
          src={user.imageUrl} 
          alt={user.username} 
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
          <h5 className="text-2xl font-bold tracking-tight text-white">
            {user.username}, {user.age}
          </h5>
          <div className="flex items-center text-gray-300 mt-1">
            <HiLocationMarker className="w-4 h-4 mr-1" />
            <span className="text-sm">{user.distance} km away</span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {user.bio}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {user.tags.map((tag, index) => (
            <Badge key={index} color="pink" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={onDislike}
            className="p-4 rounded-full bg-white border-2 border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-500 transition-colors shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-red-400 dark:hover:bg-gray-600"
          >
            <HiX className="w-8 h-8" />
          </button>
          <button 
            onClick={onLike}
            className="p-4 rounded-full bg-white border-2 border-gray-200 text-green-500 hover:bg-green-50 hover:border-green-500 transition-colors shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-green-400 dark:hover:bg-gray-600"
          >
            <HiHeart className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
