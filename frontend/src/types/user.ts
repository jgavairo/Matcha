// Light version for Dashboard (Swiping)
export interface UserSummary {
  id: number;
  username: string;
  age: number;
  gender: string;
  biography: string;
  distance: number;
  location?: {
    city: string;
    latitude: number;
    longitude: number;
  };
  tags: string[];
  images: string[];
  fameRating: number;
}

// Detailed version for Profile Page
export interface UserProfile extends UserSummary {
  firstName: string;
  lastName: string;
  sexualPreferences: string;
  isOnline: boolean;
  lastConnection: string;
  hasLikedYou: boolean;
  isMatch: boolean;
}

export interface CurrentUser extends UserProfile {
  email: string;
  likedBy: UserSummary[];
  viewedBy: UserSummary[];
  blockedUsers: UserSummary[];
}
