import { NotificationItem } from '../types/notifications';

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'match',
    sender: 'Sarah Connor',
    avatar: 'https://flowbite.com/docs/images/people/profile-picture-5.jpg',
    time: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    read: false
  },
  {
    id: '2',
    type: 'message',
    message: 'Hey! I saw you like hiking too. Where is your favorite spot?',
    sender: 'Mike Ross',
    avatar: 'https://flowbite.com/docs/images/people/profile-picture-4.jpg',
    time: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    read: false
  },
  {
    id: '3',
    type: 'like',
    sender: 'Jessica Pearson',
    avatar: 'https://flowbite.com/docs/images/people/profile-picture-3.jpg',
    time: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: true
  },
  {
    id: '4',
    type: 'visit',
    sender: 'Harvey Specter',
    avatar: 'https://flowbite.com/docs/images/people/profile-picture-2.jpg',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true
  },
  {
    id: '5',
    type: 'unlike',
    sender: 'Louis Litt',
    avatar: 'https://flowbite.com/docs/images/people/profile-picture-1.jpg',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: true
  },
  {
    id: '6',
    type: 'warning',
    title: 'Profile Incomplete',
    message: 'Add a bio to increase your chances of getting matches!',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true
  },
  {
    id: '7',
    type: 'success',
    title: 'Photo Verified',
    message: 'Your profile photo has been verified successfully.',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true
  },
  {
    id: '8',
    type: 'error',
    title: 'Upload Failed',
    message: 'Failed to upload your last photo. Please try again.',
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true
  },
  {
    id: '9',
    type: 'info',
    title: 'Welcome to Matcha',
    message: 'Thanks for joining! Start swiping to find your perfect match.',
    time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    read: true
  }
];
