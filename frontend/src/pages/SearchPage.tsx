import React, { useState, useEffect } from 'react';
import { Spinner } from 'flowbite-react';
import { UserProfile } from '@app-types/user';
import { matchService } from '@features/matches/services/matchService';
import { MatchFiltersState } from '@features/matches/types/match';
import MatchFilters from '@features/matches/components/MatchFilters';
import SearchUserCard from '@features/matches/components/SearchUserCard';
import UserProfileDrawer from '@features/matches/components/UserProfileDrawer';
import { DEFAULT_FILTERS } from '@features/matches/hooks/useMatches';

const SearchPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MatchFiltersState>(DEFAULT_FILTERS);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await matchService.searchUsers(filters);
        setUsers(results);
      } catch (err) {
        setError('Failed to load search results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters]);

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

  const handleLike = async () => {
    if (selectedUser) {
      try {
        await matchService.likeUser(selectedUser.id);
        // Optionally update UI to show liked status
        setSelectedUser(null);
      } catch (error) {
        console.error('Error liking user:', error);
      }
    }
  };

  const handleDislike = async () => {
    if (selectedUser) {
      try {
        await matchService.dislikeUser(selectedUser.id);
        setSelectedUser(null);
      } catch (error) {
        console.error('Error disliking user:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Search Users</h1>
        <div className="relative h-10 w-40">
           {/* Placeholder for layout balance if needed, or we can put the filter button here relatively */}
        </div>
      </div>

      {/* Filter Component - Positioned absolutely or relatively depending on design preference. 
          The MatchFilters component is designed with absolute positioning. 
          We might need to wrap it or adjust it. For now, let's place it and see. 
      */}
      <div className="relative mb-8 h-12">
         <MatchFilters filters={filters} onFilterChange={setFilters} mode="search" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" color="pink" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p>{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
          <p className="text-xl">No users found matching your criteria.</p>
          <p className="mt-2">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <SearchUserCard 
              key={user.id} 
              user={user} 
              onOpenProfile={() => setSelectedUser(user)} 
            />
          ))}
        </div>
      )}

      <UserProfileDrawer 
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onLike={handleLike}
        onDislike={handleDislike}
        onBlock={handleBlock}
        onReport={handleReport}
      />
    </div>
  );
};

export default SearchPage;
