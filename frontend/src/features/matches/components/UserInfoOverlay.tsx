import React from 'react';
import { UserDistance, UserFame } from './UserMeta';

interface UserInfoOverlayProps {
  username: string;
  age: number;
  distance: number;
  fameRating: number;
}

const UserInfoOverlay: React.FC<UserInfoOverlayProps> = ({ username, age, distance, fameRating }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 pointer-events-none z-card-overlay">
      <h5 className="text-2xl font-bold tracking-tight text-white">
        {username}, {age}
      </h5>
      <UserDistance 
        distance={distance} 
        className="text-gray-300 mt-1" 
      />
      <UserFame 
        rating={fameRating} 
        className="text-yellow-400 mt-1" 
      />
    </div>
  );
};

export default UserInfoOverlay;
