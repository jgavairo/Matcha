export interface MatchFiltersState {
  ageRange: [number, number];
  distanceRange: [number, number];
  fameRange: [number, number];
  minCommonTags: number;
  sortBy: 'age' | 'distance' | 'fameRating' | 'commonTags';
  sortOrder: 'asc' | 'desc';
}
