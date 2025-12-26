import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type NotificationType = 
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'like'
  | 'visit'
  | 'message'
  | 'match'
  | 'unlike';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  time: string;
  read: boolean;
  type: NotificationType;
  avatar?: string;
  sender?: string;
}

interface NotificationContextType {
  toasts: ToastMessage[];
  notifications: NotificationItem[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read' | 'time'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'match',
      sender: 'Sarah Connor',
      avatar: 'https://flowbite.com/docs/images/people/profile-picture-5.jpg',
      time: '2 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'message',
      message: 'Hey! I saw you like hiking too. Where is your favorite spot?',
      sender: 'Mike Ross',
      avatar: 'https://flowbite.com/docs/images/people/profile-picture-4.jpg',
      time: '15 minutes ago',
      read: false
    },
    {
      id: '3',
      type: 'like',
      sender: 'Jessica Pearson',
      avatar: 'https://flowbite.com/docs/images/people/profile-picture-3.jpg',
      time: '1 hour ago',
      read: true
    },
    {
      id: '4',
      type: 'visit',
      sender: 'Harvey Specter',
      avatar: 'https://flowbite.com/docs/images/people/profile-picture-2.jpg',
      time: '2 hours ago',
      read: true
    },
    {
      id: '5',
      type: 'unlike',
      sender: 'Louis Litt',
      avatar: 'https://flowbite.com/docs/images/people/profile-picture-1.jpg',
      time: '5 hours ago',
      read: true
    },
    {
      id: '6',
      type: 'warning',
      title: 'Profile Incomplete',
      message: 'Add a bio to increase your chances of getting matches!',
      time: '1 day ago',
      read: true
    },
    {
      id: '7',
      type: 'success',
      title: 'Photo Verified',
      message: 'Your profile photo has been verified successfully.',
      time: '2 days ago',
      read: true
    },
    {
      id: '8',
      type: 'error',
      title: 'Upload Failed',
      message: 'Failed to upload your last photo. Please try again.',
      time: '3 days ago',
      read: true
    },
    {
      id: '9',
      type: 'info',
      title: 'Welcome to Matcha',
      message: 'Thanks for joining! Start swiping to find your perfect match.',
      time: '1 week ago',
      read: true
    }
  ]);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'read' | 'time'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: uuidv4(),
      read: false,
      time: 'Just now', // In a real app, use actual timestamp
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        notifications,
        addToast,
        removeToast,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
