import { UserProfile } from '../types/user';

const interests = ['Travel', 'Music', 'Movies', 'Reading', 'Sports', 'Cooking', 'Photography', 'Gaming', 'Art', 'Technology'];
const bios = [
  "Loves long walks on the beach.",
  "Coffee addict and tech enthusiast.",
  "Looking for a partner in crime.",
  "Just here for the memes.",
  "Adventure seeker.",
  "Foodie at heart.",
  "Music is my life.",
  "Always learning something new.",
  "Dog lover.",
  "Cat person."
];

const generateUsers = (count: number): UserProfile[] => {
  const users: UserProfile[] = [];
  for (let i = 1; i <= count; i++) {
    const isMale = i % 2 !== 0;
    const gender = isMale ? 'Male' : 'Female';
    const randomInterest1 = interests[Math.floor(Math.random() * interests.length)];
    const randomInterest2 = interests[Math.floor(Math.random() * interests.length)];
    const randomBio = bios[Math.floor(Math.random() * bios.length)];
    
    // Generate 5 random images
    const images = Array.from({ length: 5 }, (_, index) => 
      `https://randomuser.me/api/portraits/${isMale ? 'men' : 'women'}/${(i + index) % 99}.jpg`
    );

    users.push({
      id: i,
      username: `User${i}`,
      firstName: isMale ? `John${i}` : `Jane${i}`,
      lastName: `Doe${i}`,
      age: 18 + Math.floor(Math.random() * 40),
      gender: gender,
      sexualPreferences: ['Heterosexual', 'Bisexual'],
      biography: randomBio,
      distance: Math.floor(Math.random() * 100),
      tags: Array.from(new Set([randomInterest1, randomInterest2])), // Unique tags
      images: images,
      fameRating: Math.floor(Math.random() * 100),
      isOnline: Math.random() > 0.5,
      lastConnection: '2 hours ago',
      hasLikedYou: Math.random() > 0.7,
      isMatch: false
    });
  }
  return users;
};

export const mockUsers: UserProfile[] = generateUsers(50);
