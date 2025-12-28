import React, { useState } from 'react';
import CardStack from '@features/matches/components/CardStack';
import { useMatches } from '@features/matches/hooks/useMatches';
import { Spinner } from 'flowbite-react';
import UserProfileModal from '@/features/matches/components/UserProfileDrawer';
import MatchFilters from '@/features/matches/components/MatchFilters';
import { UserProfile } from '@app-types/user';

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
    canUndo,
    filters,
    updateFilters
  } = useMatches();

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const handleBlock = () => {
    if (selectedUser) {
      console.log('Block user:', selectedUser.id);
      // Implement block logic here
    }
  };

  const handleReport = (reason: string) => {
    if (selectedUser) {
      console.log('Report user:', selectedUser.id, reason);
      // Implement report logic here
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 overflow-hidden w-full relative">
      <MatchFilters filters={filters} onFilterChange={updateFilters} />

      {loading ? (
        <div className="flex items-center justify-center">
          <Spinner size="xl" color="pink" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : isFinished ? (
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
      ) : (
        <>
          <CardStack 
            users={users}
            currentIndex={currentIndex}
            onLike={handleLike}
            onDislike={handleDislike}
            onUndo={handleUndo}
            canUndo={canUndo}
            onOpenProfile={setSelectedUser}
          />

          <UserProfileModal 
            user={selectedUser}
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            onLike={() => { if (selectedUser) { handleLike(selectedUser.id.toString()); setSelectedUser(null); } }}
            onDislike={() => { if (selectedUser) { handleDislike(selectedUser.id.toString()); setSelectedUser(null); } }}
            onBlock={handleBlock}
            onReport={handleReport}
          />
        </>
      )}
    </div>
  );
};

export default DiscoverPage;
