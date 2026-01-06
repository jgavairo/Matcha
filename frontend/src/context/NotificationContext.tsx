import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ToastType, NotificationItem, ToastMessage, ToastAction } from '@app-types/notifications';

interface NotificationContextType {
  toasts: ToastMessage[];
  notifications: NotificationItem[];
  addToast: (message: string, type: ToastType, duration?: number, options?: { title?: string, actions?: ToastAction[] }) => void;
  removeToast: (id: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read' | 'time'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000, options?: { title?: string, actions?: ToastAction[] }) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type, duration, ...options }]);

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
      time: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);

    // Map notification type to toast type
    let toastType: ToastType = 'info';
    if (['success', 'match'].includes(notification.type)) toastType = 'success';
    if (notification.type === 'error') toastType = 'error';
    if (notification.type === 'warning') toastType = 'warning';

    // Create toast message
    const toastMessage = notification.title 
      ? `${notification.title}: ${notification.message}` 
      : notification.message || 'New notification';

    addToast(toastMessage, toastType);
  }, [addToast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
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
        removeNotification,
        clearNotifications,
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
