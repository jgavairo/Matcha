import { UserProfile } from '../../../types/user';
import { mockUsers } from '../../../data/mockUsers';
import { MatchFiltersState } from '../types/match';

// Simulating API calls
export const matchService = {
  getRecommendations: async (): Promise<UserProfile[]> => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockUsers]);
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
  },

  searchUsers: async (filters: MatchFiltersState, page: number = 1, limit: number = 12): Promise<{ data: UserProfile[], total: number }> => {
    // Simulate network delay and server-side filtering
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...mockUsers];

        // Helper to calculate distance between two points (Haversine formula)
        const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; // Radius of the earth in km
          const dLat = (lat2 - lat1) * (Math.PI / 180);
          const dLon = (lon2 - lon1) * (Math.PI / 180);
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2); 
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
          const d = R * c; // Distance in km
          return d;
        };

        // Mock geocoding for search location
        // In a real app, the backend would geocode the search string
        const mockLocations: Record<string, { lat: number, lng: number }> = {
          'paris': { lat: 48.8566, lng: 2.3522 },
          'lyon': { lat: 45.7640, lng: 4.8357 },
          'marseille': { lat: 43.2965, lng: 5.3698 },
          'bordeaux': { lat: 44.8378, lng: -0.5792 },
          'lille': { lat: 50.6292, lng: 3.0573 }
        };

        let searchLocationCoords = null;
        if (filters.location) {
          const searchCity = filters.location.toLowerCase().trim();
          // Simple mock geocoding: check if we know the city
          // If we don't know it, we might just filter by string match on city name
          if (mockLocations[searchCity]) {
            searchLocationCoords = mockLocations[searchCity];
          }
        }

        // Apply filters (simulating server-side logic)
        results = results.filter(user => {
          // 1. Age Filter
          if (user.age < filters.ageRange[0] || user.age > filters.ageRange[1]) return false;

          // 2. Fame Filter
          if (user.fameRating < filters.fameRange[0]) return false;

          // 3. Tags Filter (Common Tags count)
          if (user.tags.length < filters.minCommonTags) return false;

          // 4. Specific Tags Filter
          if (filters.tags.length > 0) {
             const hasMatchingTags = filters.tags.every(tag => 
              user.tags.some(userTag => userTag.toLowerCase() === tag.toLowerCase())
            );
            if (!hasMatchingTags) return false;
          }

          // 5. Location & Distance Filter
          if (filters.location && searchLocationCoords && user.location) {
            // If searching by location, calculate distance from THAT location
            const dist = getDistanceFromLatLonInKm(
              searchLocationCoords.lat, searchLocationCoords.lng,
              user.location.latitude, user.location.longitude
            );
            return dist <= filters.distanceRange[1];
          } else if (filters.location && user.location) {
             // Fallback: if we can't geocode, just match city name string
             // And ignore distance slider (or treat as 0)
             return user.location.city.toLowerCase().includes(filters.location.toLowerCase());
          } else {
            // Default: Distance from current user (as stored in user.distance)
            return user.distance <= filters.distanceRange[1];
          }
        });

        // Apply sorting (simulating server-side logic)
        results.sort((a, b) => {
          let valA: number | undefined;
          let valB: number | undefined;
          
          if (filters.sortBy === 'commonTags') {
            valA = a.tags.length;
            valB = b.tags.length;
          } else {
            const key = filters.sortBy as keyof Pick<UserProfile, 'age' | 'distance' | 'fameRating'>;
            valA = a[key];
            valB = b[key];
          }

          if (valA === undefined || valB === undefined) return 0;

          if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        const total = results.length;
        const start = (page - 1) * limit;
        const paginatedResults = results.slice(start, start + limit);

        resolve({ data: paginatedResults, total });
      }, 800);
    });
  }
};
