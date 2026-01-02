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
  location: '',
  sortBy: 'distance',
  sortOrder: 'asc'
};

export const useMatches = () => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MatchFiltersState>(DEFAULT_FILTERS);

  // Initial load
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await matchService.getRecommendations();
      setAllUsers(data);
    } catch (err) {
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sort whenever filters or allUsers change
  useEffect(() => {
    if (allUsers.length === 0) return;

    let filtered = [...allUsers];

    // Filter
    filtered = filtered.filter(user => 
      user.age >= filters.ageRange[0] && 
      user.age <= filters.ageRange[1] &&
      user.distance <= filters.distanceRange[1] &&
      user.fameRating >= filters.fameRange[0] &&
      // Mock common tags check (using length for now as we don't have current user tags here yet)
      user.tags.length >= filters.minCommonTags
    );

    // Sort
    filtered.sort((a, b) => {
      let valA: number | undefined;
      let valB: number | undefined;
      
      if (filters.sortBy === 'commonTags') {
        valA = a.tags.length;
        valB = b.tags.length;
      } else {
        // Safe cast because we know sortBy is one of the numeric keys if it's not commonTags
        const key = filters.sortBy as keyof Pick<UserProfile, 'age' | 'distance' | 'fameRating'>;
        valA = a[key];
        valB = b[key];
      }

      if (valA === undefined || valB === undefined) return 0;

      if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setUsers(filtered);
    setCurrentIndex(0); // Reset stack when filters change
  }, [filters, allUsers]);

  const updateFilters = (newFilters: MatchFiltersState) => {
    setFilters(newFilters);
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
      console.error('Error liking user:', err);
    }
  }, [users, currentIndex, nextUser]);

  const handleDislike = useCallback(async (userId?: string | number) => {
    const targetId = userId ? Number(userId) : users[currentIndex]?.id;
    if (!targetId) return;

    try {
      await matchService.dislikeUser(targetId);
      // Only advance index if we disliked the current user
      if (!userId || Number(userId) === users[currentIndex]?.id) {
        nextUser();
      }
    } catch (err) {
      console.error('Error disliking user:', err);
    }
  }, [users, currentIndex, nextUser]);

  const currentUser = users[currentIndex];
  const isFinished = !loading && currentIndex >= users.length;

  return {
    users,
    currentIndex,
    currentUser,
    loading,
    error,
    isFinished,
    handleLike,
    handleDislike,
    filters,
    updateFilters
  };
};
