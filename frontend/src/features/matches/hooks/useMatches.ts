import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../../../types/user';
import { matchService } from '../services/matchService';

export const useMatches = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<number[]>([]); // Store indices of passed users

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await matchService.getRecommendations();
      setUsers(data);
    } catch (err) {
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
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

  const handleUndo = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const currentUser = users[currentIndex];
  const isFinished = !loading && currentIndex >= users.length;
  const canUndo = currentIndex > 0;

  return {
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
  };
};
