import React from 'react';
import { HiX, HiHeart, HiLocationMarker, HiStar, HiRefresh } from 'react-icons/hi';
import { UserSummary } from '../../../types/user';
import { Badge, Button, Card, Tooltip, Carousel } from 'flowbite-react';

interface UserCardProps {
  user: UserSummary;
  onLike: () => void;
  onDislike: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

const customCardTheme = {
  root: {
    children: "flex h-full flex-col justify-center gap-0 p-0",
  }
};

const UserCard: React.FC<UserCardProps> = ({ user, onLike, onDislike, onUndo, canUndo }) => {
  return (
    <Card 
      theme={customCardTheme}
      className="w-full max-w-sm h-full max-h-[600px] overflow-hidden border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="relative flex-grow min-h-0 w-full">
        <Carousel slide={false} indicators={true} className="h-full">
          {user.images.map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              alt={`${user.username} - ${idx + 1}`} 
              className="h-full w-full object-cover" 
            />
          ))}
        </Carousel>

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
            <Badge key={index} color="pink" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex justify-center items-center gap-6 mt-4">
          <Tooltip content="Undo last action">
            <Button 
              color="yellow" 
              outline
              pill 
              size="lg"
              onClick={(e) => { e.stopPropagation(); onUndo(); }}
              disabled={!canUndo}
              className="!p-2"
            >
              <HiRefresh className="w-5 h-5" />
            </Button>
          </Tooltip>

          <Button 
            color="red" 
            outline
            pill 
            size="xl" 
            onClick={(e) => { e.stopPropagation(); onDislike(); }}
            className="!p-3"
          >
            <HiX className="w-8 h-8" />
          </Button>

          <Button 
            color="primary" 
            outline
            pill 
            size="xl" 
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className="!p-3"
          >
            <HiHeart className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
