export interface MatchFiltersState {
  ageRange: [number, number];
  distanceRange: [number, number];
  fameRange: [number, number];
  minCommonTags: number;
  tags: string[];
  location: string;
  sortBy: 'age' | 'distance' | 'fameRating' | 'commonTags';
  sortOrder: 'asc' | 'desc';
}
