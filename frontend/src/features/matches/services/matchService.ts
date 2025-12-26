import { User } from '../../../types/user';
import { mockUsers } from '../../../data/mockUsers';

// Simulating API calls
export const matchService = {
  getRecommendations: async (): Promise<User[]> => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUsers);
      }, 500);
    });
  },

  likeUser: async (userId: number): Promise<void> => {
    console.log(`Liked user ${userId} (API call)`);
    return Promise.resolve();
  },

  dislikeUser: async (userId: number): Promise<void> => {
    console.log(`Disliked user ${userId} (API call)`);
    return Promise.resolve();
  }
};
