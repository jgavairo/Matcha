import React from 'react';
import { UserProfile } from '@app-types/user';
import UserCard from './UserCard';

interface CardStackProps {
  users: UserProfile[];
  currentIndex: number;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onUndo: () => void;
  canUndo: boolean;
  onOpenProfile: (user: UserProfile) => void;
}

const CardStack: React.FC<CardStackProps> = ({ 
  users, 
  currentIndex, 
  onLike, 
  onDislike, 
  onUndo, 
  canUndo,
  onOpenProfile
}) => {
  return (
    <div className="w-full max-w-sm 2xl:max-w-md h-[70vh] max-h-[800px] relative">
      <div 
        className="flex flex-col h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateY(-${currentIndex * 200}%)` }}
      >
        {users.map((user, index) => {
          // Only render cards around the current index to improve performance
          // Keep one previous card rendered for smooth transitions/undo
          const shouldRender = index >= currentIndex - 1 && index < currentIndex + 5;
          
          return (
            <div key={user.id} className="w-full flex-shrink-0" style={{ height: '200%' }}>
              <div className="w-full h-1/2">
                {shouldRender && (
                  <UserCard 
                    user={user} 
                    onLike={() => onLike(user.id.toString())} 
                    onDislike={() => onDislike(user.id.toString())} 
                    onUndo={onUndo}
                    canUndo={canUndo}
                    onOpenProfile={() => onOpenProfile(user)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardStack;
