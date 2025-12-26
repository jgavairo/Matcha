import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'message' | 'like' | 'match' | 'system';
  avatar?: string;
  sender?: string;
}

interface NotificationContextType {
  toasts: ToastMessage[];
  notifications: NotificationItem[];
  addToast: (message: string, type: NotificationType, duration?: number) => void;
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
    // Mock data based on user's snippet
    {
      id: '1',
      type: 'message',
      title: 'New message',
      message: 'Hey, what\'s up? All set for the presentation?',
      sender: 'Jese Leos',
      avatar: '/docs/images/people/profile-picture-1.jpg',
      time: 'a few moments ago',
      read: false
    },
    {
      id: '2',
      type: 'system',
      title: 'New followers',
      message: 'Joseph Mcfall and 5 others started following you.',
      avatar: '/docs/images/people/profile-picture-2.jpg',
      time: '10 minutes ago',
      read: false
    },
    {
      id: '3',
      type: 'like',
      title: 'New like',
      message: 'Bonnie Green and 141 others love your story.',
      avatar: '/docs/images/people/profile-picture-3.jpg',
      time: '44 minutes ago',
      read: true
    }
  ]);

  const addToast = useCallback((message: string, type: NotificationType, duration = 4000) => {
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
