import React from 'react';
import { HiLocationMarker, HiStar } from 'react-icons/hi';

interface UserInfoOverlayProps {
  username: string;
  age: number;
  distance: number;
  fameRating: number;
}

const UserInfoOverlay: React.FC<UserInfoOverlayProps> = ({ username, age, distance, fameRating }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 pointer-events-none z-10">
      <h5 className="text-2xl font-bold tracking-tight text-white">
        {username}, {age}
      </h5>
      <div className="flex items-center text-gray-300 mt-1">
        <HiLocationMarker className="w-4 h-4 mr-1" />
        <span className="text-sm">{distance} km away</span>
      </div>
      <div className="flex items-center text-yellow-400 mt-1">
        <HiStar className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium text-white">{fameRating}</span>
      </div>
    </div>
  );
};

export default UserInfoOverlay;
