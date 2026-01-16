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
  isOnline?: boolean;
  lastConnection?: string;
}

// Detailed version for Profile Page
export interface UserProfile extends UserSummary {
  firstName: string;
  lastName: string;
  sexualPreferences: string[];
  birthDate: string;
  isOnline: boolean;
  lastConnection: string;
  hasLikedYou: boolean;
  isLiked?: boolean;
  isMatch: boolean;
}

export interface CurrentUser extends UserProfile {
  email: string;
  statusId: number; // 0: NEW, 1: VERIFIED, 2: COMPLETED
  likedBy: UserSummary[];
  viewedBy: UserSummary[];
  matches: UserSummary[];
  blockedUsers: UserSummary[];
  geolocationConsent: boolean;
  likesCount?: number;
  viewsCount?: number;
}
