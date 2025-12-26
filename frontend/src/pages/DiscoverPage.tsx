import React from 'react';
import CardStack from '@features/matches/components/CardStack';
import { useMatches } from '@features/matches/hooks/useMatches';
import { Spinner } from 'flowbite-react';

const DiscoverPage: React.FC = () => {
  const { 
    users,
    currentIndex,
    loading, 
    error, 
    isFinished, 
    handleLike, 
    handleDislike,
    handleUndo,
    canUndo
  } = useMatches();

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

  if (isFinished) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No more profiles!</h2>
          <p className="text-gray-500 dark:text-gray-400">Check back later for more matches.</p>
          {canUndo && (
            <button 
              onClick={handleUndo}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800"
            >
              Undo Last Action
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4 overflow-hidden w-full">
      <CardStack 
        users={users}
        currentIndex={currentIndex}
        onLike={handleLike}
        onDislike={handleDislike}
        onUndo={handleUndo}
        canUndo={canUndo}
      />
    </div>
  );
};

export default DiscoverPage;
