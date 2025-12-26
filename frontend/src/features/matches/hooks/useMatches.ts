import { useState, useEffect, useCallback } from 'react';
import { User } from '../../../types/user';
import { matchService } from '../services/matchService';

export const useMatches = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleLike = useCallback(async () => {
    if (!users[currentIndex]) return;
    try {
      await matchService.likeUser(users[currentIndex].id);
      nextUser();
    } catch (err) {
      console.error('Error liking user:', err);
    }
  }, [users, currentIndex, nextUser]);

  const handleDislike = useCallback(async () => {
    if (!users[currentIndex]) return;
    try {
      await matchService.dislikeUser(users[currentIndex].id);
      nextUser();
    } catch (err) {
      console.error('Error disliking user:', err);
    }
  }, [users, currentIndex, nextUser]);

  const currentUser = users[currentIndex];
  const isFinished = !loading && currentIndex >= users.length;

  return {
    currentUser,
    loading,
    error,
    isFinished,
    handleLike,
    handleDislike
  };
};
