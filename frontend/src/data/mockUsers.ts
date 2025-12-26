import { User } from '../types/user';

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

const generateUsers = (count: number): User[] => {
  const users: User[] = [];
  for (let i = 1; i <= count; i++) {
    const gender = i % 2 === 0 ? 'female' : 'male';
    const randomInterest1 = interests[Math.floor(Math.random() * interests.length)];
    const randomInterest2 = interests[Math.floor(Math.random() * interests.length)];
    const randomBio = bios[Math.floor(Math.random() * bios.length)];
    
    users.push({
      id: i,
      username: `User${i}`,
      age: 18 + Math.floor(Math.random() * 40),
      gender: gender,
      bio: randomBio,
      distance: Math.floor(Math.random() * 100),
      tags: Array.from(new Set([randomInterest1, randomInterest2])), // Unique tags
      imageUrl: `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${i % 99}.jpg`
    });
  }
  return users;
};

export const mockUsers: User[] = generateUsers(50);
