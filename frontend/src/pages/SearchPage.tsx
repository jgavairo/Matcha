import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Spinner, Button } from 'flowbite-react';
import { HiArrowUp } from 'react-icons/hi';
import { UserProfile } from '@app-types/user';
import { matchService } from '@features/matches/services/matchService';
import { MatchFiltersState } from '@features/matches/types/match';
import MatchFilters from '@features/matches/components/MatchFilters';
import UserCard from '@features/matches/components/UserCard';
import UserProfileDrawer from '@features/matches/components/UserProfileDrawer';
import { DEFAULT_FILTERS } from '@features/matches/hooks/useMatches';

const SearchPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MatchFiltersState>(DEFAULT_FILTERS);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const observerTarget = useRef(null);

  const fetchUsers = useCallback(async (pageNum: number, isNewFilter: boolean = false) => {
    if (isNewFilter) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      const { data, total } = await matchService.searchUsers(filters, pageNum);
      
      if (isNewFilter) {
        setUsers(data);
      } else {
        setUsers(prev => [...prev, ...data]);
      }
      
      setHasMore(users.length + data.length < total);
      // Correction: The above check is slightly wrong because 'users' is stale in the closure if not careful, 
      // but since we use functional update for setUsers, we are good for the state update.
      // However, for hasMore, we need the updated count.
      // A safer check for hasMore:
      // If we received fewer items than the limit (12), we are done.
      // Or if (pageNum * 12) >= total.
      setHasMore((pageNum * 12) < total);

    } catch (err) {
      setError('Failed to load search results');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  const handleFilterChange = (newFilters: MatchFiltersState) => {
    setFilters(newFilters);
    setHasSearched(true);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setUsers([]);
    setHasSearched(false);
    setHasMore(true);
    setPage(1);
  };

  // Reset and fetch when filters change
  useEffect(() => {
    if (!hasSearched) return;
    setPage(1);
    setHasMore(true);
    fetchUsers(1, true);
  }, [filters, hasSearched]);

  // Infinite scroll observer
  useEffect(() => {
    const scrollContainer = document.getElementById('app-scroll-container');
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage(prev => {
            const nextPage = prev + 1;
            fetchUsers(nextPage, false);
            return nextPage;
          });
        }
      },
      { 
        root: scrollContainer,
        threshold: 0.1 
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, loadingMore, fetchUsers]);

  // Scroll to top logic
  useEffect(() => {
    const scrollContainer = document.getElementById('app-scroll-container');
    if (!scrollContainer) return;

    const handleScroll = () => {
      setShowScrollTop(scrollContainer.scrollTop > 300);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.getElementById('app-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
      {/* Filter Bar */}
      <MatchFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        mode="search" 
        isOpen={isFiltersOpen}
        onToggle={setIsFiltersOpen}
        hasSearched={hasSearched}
        onClear={handleClearFilters}
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Search Users</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" color="pink" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p>{error}</p>
        </div>
      ) : !hasSearched ? (
        <div className="flex flex-col items-center justify-center mt-12 text-gray-500 dark:text-gray-400">
          <p className="text-xl mb-6">Use filters to find people</p>
          <Button color="pink" size="lg" onClick={() => setIsFiltersOpen(true)}>
            Search Users
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
          <p className="text-xl">No users found matching your criteria.</p>
          <p className="mt-2">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {users.map((user) => (
              <div key={user.id} className="h-[400px]">
                <UserCard 
                  user={user} 
                  onOpenProfile={() => setSelectedUser(user)}
                  showActions={false}
                />
              </div>
            ))}
          </div>
          
          {/* Sentinel element for infinite scroll */}
          <div ref={observerTarget} className="h-10 flex justify-center items-center mt-4">
            {loadingMore && <Spinner size="md" color="pink" />}
            {!hasMore && users.length > 0 && (
              <p className="text-gray-500 text-sm">No more results</p>
            )}
          </div>
        </>
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

      {/* Back to Top Button */}
      {showScrollTop && (
        <Button
          className="fixed bottom-20 right-6 z-scroll-top rounded-full shadow-lg"
          color="pink"
          size="lg"
          onClick={scrollToTop}
        >
          <HiArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default SearchPage;
