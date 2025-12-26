import React from 'react';
import { useNotification } from '@context/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationDropdown: React.FC = () => {
  const { notifications } = useNotification();

  return (
    <div className="absolute bottom-16 left-0 right-0 mx-auto w-full max-w-sm bg-white divide-y divide-gray-100 rounded-t-lg shadow-lg dark:bg-gray-800 dark:divide-gray-700 border-t border-x border-gray-200 dark:border-gray-600">
      <div className="block px-4 py-2 font-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">
        Notifications
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
      <a href="#" className="block py-2 text-sm font-medium text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
        <div className="inline-flex items-center ">
          <svg className="w-4 h-4 me-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
            <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
          </svg>
          Clear all
        </div>
      </a>
    </div>
  );
};

export default NotificationDropdown;
