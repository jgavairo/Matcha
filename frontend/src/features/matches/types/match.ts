export interface MatchFiltersState {
  ageRange: [number, number];
  distanceRange: [number, number];
  fameRange: [number, number];
  minCommonTags: number;
  tags: string[];
  location: string;
  locationCoords?: { latitude: number; longitude: number };
  sortBy: 'age' | 'distance' | 'fameRating' | 'commonTags';
  sortOrder: 'asc' | 'desc';
}
