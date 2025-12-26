import React from 'react';
import UserCard from '../features/matches/components/UserCard';
import { useMatches } from '../features/matches/hooks/useMatches';
import { Spinner } from 'flowbite-react';

const DashboardPage: React.FC = () => {
  const { currentUser, loading, error, isFinished, handleLike, handleDislike } = useMatches();

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <Spinner size="xl" color="pink" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isFinished || !currentUser) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No more profiles!</h2>
          <p className="text-gray-500 dark:text-gray-400">Check back later for more matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <UserCard 
        user={currentUser} 
        onLike={handleLike} 
        onDislike={handleDislike} 
      />
    </div>
  );
};

export default DashboardPage;
