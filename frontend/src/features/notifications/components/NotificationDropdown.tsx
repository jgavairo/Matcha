import React, { useMemo } from 'react';
import { useNotification } from '@context/NotificationContext';
import { NotificationType, NotificationItem as NotificationItemType } from '@app-types/notifications';
import NotificationItem from './NotificationItem';
import { HiX } from 'react-icons/hi';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, clearNotifications, markAsRead, removeNotification } = useNotification();

  const groupedNotifications = useMemo(() => {
    const groups = new Map<string, NotificationItemType[]>();
    
    notifications.forEach(n => {
       const key = n.sender 
         ? `${n.type}-${n.sender}` 
         : `${n.type}-${n.message || ''}`;
       
       if (!groups.has(key)) {
           groups.set(key, []);
       }
       groups.get(key)!.push(n);
    });
    
    return Array.from(groups.values()).map(group => {
       group.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
       return {
           latest: group[0],
           items: group,
           count: group.length,
           hasUnread: group.some(n => !n.read)
       };
    }).sort((a, b) => new Date(b.latest.time).getTime() - new Date(a.latest.time).getTime());
  }, [notifications]);

  return (
    <div 
      className={`fixed top-16 bottom-16 left-0 right-0 z-notification mx-auto flex flex-col w-full sm:max-w-sm bg-white divide-y divide-gray-100 shadow-lg dark:bg-gray-800 dark:divide-gray-700 border-x border-gray-200 dark:border-gray-600 sm:fixed sm:top-auto sm:bottom-16 sm:h-auto sm:max-h-[60vh] sm:rounded-t-lg sm:border-t transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-[100%]'
      }`}
    >
      <div className="flex-none flex items-center justify-between px-4 py-2 font-medium text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white sm:rounded-t-lg">
        <span>Notifications</span>
        <button 
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Close notifications"
        >
          <HiX className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
        {groupedNotifications.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            No notifications
          </div>
        ) : (
          groupedNotifications.map((group) => (
            <NotificationItem 
               key={group.latest.id} 
               notification={{ ...group.latest, read: !group.hasUnread }}
               count={group.count}
               onMarkAsRead={() => {
                   group.items.forEach(n => !n.read && markAsRead(n.id));
               }}
               onRemove={() => {
                   group.items.forEach(n => removeNotification(n.id));
               }}
            />
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <button 
          onClick={clearNotifications}
          className="flex-none w-full block py-2 text-sm font-medium text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white sm:rounded-b-lg"
        >
          <div className="inline-flex items-center justify-center w-full">
            <svg className="w-4 h-4 me-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
              <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
            </svg>
            Clear all
          </div>
        </button>
      )}
    </div>
  );
};

export default NotificationDropdown;
