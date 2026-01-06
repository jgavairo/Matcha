import { UserProfile } from '../../../types/user';
import { MatchFiltersState } from '../types/match';
import { api } from '../../../services/api';

// Simulating API calls
export const matchService = {
  getRecommendations: async (): Promise<UserProfile[]> => {
    const { data } = await matchService.searchUsers({
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
    }, 1, 20);
    return data;
  },

  likeUser: async (userId: number): Promise<{ isMatch: boolean }> => {
    const response = await api.post(`/matches/${userId}/like`);
    return response.data;
  },

  dislikeUser: async (userId: number): Promise<void> => {
    await api.post(`/matches/${userId}/dislike`);
  },

  unlikeUser: async (userId: number): Promise<void> => {
    await api.delete(`/matches/${userId}/like`);
  },

  searchUsers: async (filters: MatchFiltersState, page: number, limit: number): Promise<{ data: UserProfile[], total: number }> => {
    try {
      const response = await api.post('/matches/search', {
          ...filters,
          page,
          limit
      });
      
      return {
          data: response.data.data.map((user: any) => ({
              id: user.id,
              username: user.username,
              firstName: user.first_name,
              lastName: user.last_name,
              age: user.age,
              gender: user.gender,
              biography: user.biography || '',
              tags: user.tags || [],
              fameRating: user.fame_rating || 0,
              distance: Math.round(user.distance || 0),
              isOnline: false, // Placeholder
              lastConnection: new Date().toISOString(), // Placeholder
              images: user.profile_picture ? [user.profile_picture] : ['https://via.placeholder.com/150'],
              location: {
                  city: user.city || '',
                  latitude: user.latitude || 0,
                  longitude: user.longitude || 0
              },
              sexualPreferences: user.sexual_preferences || [],
              hasLikedYou: user.has_liked_you || false,
              isMatch: user.is_match || false
          })),
          total: response.data.total
      };
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};
