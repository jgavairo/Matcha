import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../../../types/user';
import { matchService } from '../services/matchService';
import { MatchFiltersState } from '../types/match';

export const DEFAULT_FILTERS: MatchFiltersState = {
  ageRange: [18, 99],
  distanceRange: [0, 500],
  fameRange: [0, 1000],
  minCommonTags: 0,
  tags: [],
  gender: [],
  sexualPreference: [],
  location: '',
  sortBy: 'distance',
  sortOrder: 'asc'
};

export const useMatches = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MatchFiltersState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch users when page or filters change
  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetching(true);
      if (page === 1) setLoading(true); // Only show full loading on first page
      
      try {
        const { data } = await matchService.searchUsers(filters, page, 10);
        
        if (page === 1) {
          setUsers(data);
        } else {
          setUsers(prev => {
            // Filter out duplicates just in case
            const newUsers = data.filter(newUser => !prev.some(u => u.id === newUser.id));
            return [...prev, ...newUsers];
          });
        }
        
        // If we received fewer items than limit, we've reached the end
        setHasMore(data.length === 10);
      } catch (err) {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, [page, filters]);

  // Infinite scroll trigger
  useEffect(() => {
    if (!isFetching && hasMore && users.length > 0 && currentIndex >= users.length - 3) {
      setPage(prev => prev + 1);
    }
  }, [currentIndex, users.length, isFetching, hasMore]);

  const updateFilters = (newFilters: MatchFiltersState) => {
    setFilters(newFilters);
    setPage(1);
    setCurrentIndex(0);
    setHasMore(true);
    setUsers([]); // Clear users to show loading state
  };

  const nextUser = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleLike = useCallback(async (userId?: string | number) => {
    const targetId = userId ? Number(userId) : users[currentIndex]?.id;
    if (!targetId) return;

    try {
      await matchService.likeUser(targetId);
      // Only advance index if we liked the current user
      if (!userId || Number(userId) === users[currentIndex]?.id) {
        nextUser();
      }
    } catch (err) {
      // Error already handled by UI
    }
  }, [users, currentIndex, nextUser]);

  const handleDislike = useCallback(async (userId?: string | number) => {
    const targetId = userId ? Number(userId) : users[currentIndex]?.id;
    if (!targetId) return;

    const isCurrentUser = !userId || Number(userId) === users[currentIndex]?.id;
    const previousUsers = [...users];

    // Remove user from list immediately (optimistic update)
    setUsers(prev => prev.filter(u => u.id !== targetId));
    
    // Adjust currentIndex if we removed the current user
    if (isCurrentUser && currentIndex > 0) {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }

    try {
      await matchService.dislikeUser(targetId);
      // Advance to next user if we disliked the current one
      if (isCurrentUser) {
        nextUser();
      }
    } catch (err) {
      // Revert on error
      setUsers(previousUsers);
      if (isCurrentUser) {
        setCurrentIndex(prev => Math.min(prev, previousUsers.length - 1));
      }
    }
  }, [users, currentIndex, nextUser]);

  const currentUser = users[currentIndex];
  const isFinished = !isFetching && currentIndex >= users.length && !hasMore;

  return {
    users,
    currentIndex,
    currentUser,
    loading,
    isFetching,
    error,
    isFinished,
    handleLike,
    handleDislike,
    filters,
    updateFilters
  };
};
