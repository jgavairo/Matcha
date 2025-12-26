export interface User {
  id: number;
  username: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bio: string;
  distance: number; // in km
  tags: string[];
  imageUrl: string;
}
