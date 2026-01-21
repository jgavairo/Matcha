import React, { useState, useMemo } from 'react';
import CardStack from '@features/matches/components/CardStack';
import { useMatches, DEFAULT_FILTERS } from '@features/matches/hooks/useMatches';
import { useBlockUser } from '@features/matches/hooks/useBlockUser';
import { Spinner, Button } from 'flowbite-react';
import UserProfileModal from '@features/matches/components/UserProfileDrawer';
import MatchFilters from '@features/matches/components/MatchFilters';
import { UserProfile } from '@app-types/user';
import { api } from '@/services/api';
import { useNotification } from '@context/NotificationContext';

const DiscoverPage: React.FC = () => {
  const { 
    users,
    currentIndex,
    loading,
    isFetching,
    error, 
    isFinished, 
    handleLike, 
    handleDislike,
    filters,
    updateFilters 
  } = useMatches();

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const { addToast } = useNotification();
  const { blockUser } = useBlockUser();
  
  const hasActiveFilters = useMemo(() => {
    const { sortBy, sortOrder, ...filterCriteria } = filters;
    const { sortBy: defaultSortBy, sortOrder: defaultSortOrder, ...defaultCriteria } = DEFAULT_FILTERS;
    return JSON.stringify(filterCriteria) !== JSON.stringify(defaultCriteria);
  }, [filters]);

  const handleBlock = async () => {
    if (selectedUser) {
      await handleDislike(selectedUser.id.toString());
      await blockUser(selectedUser.id, () => {
        setSelectedUser(null);
      });
    }
  };


  const handleReport = async (reasons: string[]) => {
    if (selectedUser) {
      if (selectedUser) {
        try {
          const response = await api.post(`/report`, {
            reportedId: selectedUser.id,
            reasons: reasons
          });
  
          if (response.status === 200) {
            addToast('User reported successfully', 'success');
          } else {
            addToast((response as any).response?.data?.error || 'Failed to report user', 'error');
          }
        } catch (error) {
          addToast((error as any).response?.data?.error || 'Failed to report user', 'error');
        }
      }
    }
  };

  const handleOpenProfile = (user: UserProfile) => {
    setSelectedUser(user);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-start md:justify-center p-4 overflow-hidden w-full relative">
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
          <p className="text-gray-500 dark:text-gray-400">
            {hasActiveFilters 
              ? "Try adjusting your filters to see more people." 
              : "Check back later for more matches."}
          </p>
        </div>
      ) : (
        <>
          <div className="relative w-full flex justify-center">
            <CardStack 
              users={users}
              currentIndex={currentIndex}
              onLike={handleLike}
              onDislike={handleDislike}
              onOpenProfile={handleOpenProfile}
            />
            {isFetching && currentIndex >= users.length && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <Spinner size="xl" color="pink" />
              </div>
            )}
          </div>

          <UserProfileModal 
            user={selectedUser}
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            onLike={() => { if (selectedUser) { handleLike(selectedUser.id.toString()); setSelectedUser(null); } }}
            onDislike={() => { if (selectedUser) { handleDislike(selectedUser.id.toString()); setSelectedUser(null); } }}
            onBlock={handleBlock}
            onReport={handleReport}
            showPassButton={true}
          />
        </>
      )}
    </div>
  );
};

export default DiscoverPage;
