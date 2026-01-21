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
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch users when cursor or filters change
  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetching(true);
      if (!cursor) setLoading(true); // Only show full loading on first page
      
      try {
        const { data, cursor: newNextCursor } = await matchService.searchUsers(filters, cursor, 10);
        
        if (!cursor) {
          setUsers(data);
        } else {
          setUsers(prev => {
            // Filter out duplicates just in case
            const newUsers = data.filter(newUser => !prev.some(u => u.id === newUser.id));
            return [...prev, ...newUsers];
          });
        }
        
        setNextCursor(newNextCursor);
        setHasMore(!!newNextCursor);
      } catch (err) {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, [cursor, filters]);

  // Infinite scroll trigger
  useEffect(() => {
    if (!isFetching && hasMore && users.length > 0 && currentIndex >= users.length - 3) {
      if (nextCursor && nextCursor !== cursor) {
          setCursor(nextCursor);
      }
    }
  }, [currentIndex, users.length, isFetching, hasMore, nextCursor, cursor]);

  const updateFilters = (newFilters: MatchFiltersState) => {
    setFilters(newFilters);
    setCursor(null);
    setNextCursor(null);
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

    // Optimistic UI updates
    if (isCurrentUser) {
      nextUser();
    } else {
      setUsers(prev => prev.filter(u => u.id !== targetId));
    }

    try {
      await matchService.dislikeUser(targetId);
    } catch (err) {
      // Revert on error
      if (isCurrentUser) {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else {
        setUsers(previousUsers);
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
