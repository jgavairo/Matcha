import React from 'react';
import UserCard from '../features/matches/components/UserCard';
import { useMatches } from '../features/matches/hooks/useMatches';
import { Spinner } from 'flowbite-react';

const DashboardPage: React.FC = () => {
  const { 
    users,
    currentIndex,
    currentUser, 
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
      <div className="w-full max-w-sm h-[600px] relative">
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
                      onLike={handleLike} 
                      onDislike={handleDislike} 
                      onUndo={handleUndo}
                      canUndo={canUndo}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
