import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '@context/NotificationContext';
import { HiMail, HiHeart, HiUserAdd, HiInformationCircle } from 'react-icons/hi';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAllAsRead } = useNotification();

  const toggleDropdown = () => {
    if (!isOpen && unreadCount > 0) {
        // Optional: Mark all as read when opening? Or maybe just let user see them first.
        // markAllAsRead(); 
    }
    setIsOpen(!isOpen);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-blue-600 border border-white rounded-full dark:border-gray-800"><HiMail className="w-3 h-3 text-white" /></div>;
      case 'like':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-red-600 border border-white rounded-full dark:border-gray-800"><HiHeart className="w-3 h-3 text-white" /></div>;
      case 'match':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-purple-600 border border-white rounded-full dark:border-gray-800"><HiUserAdd className="w-3 h-3 text-white" /></div>;
      case 'system':
      default:
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-gray-600 border border-white rounded-full dark:border-gray-800"><HiInformationCircle className="w-3 h-3 text-white" /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative inline-flex items-center text-sm font-medium text-center text-gray-500 hover:text-gray-900 focus:outline-none dark:hover:text-white dark:text-gray-400" 
        type="button"
      >
        <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5.365V3m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175 0 .593 0 1.292-.538 1.292H5.538C5 18 5 17.301 5 16.708c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 12 5.365ZM8.733 18c.094.852.306 1.54.944 2.112a3.48 3.48 0 0 0 4.646 0c.638-.572 1.236-1.26 1.33-2.112h-6.92Z"/>
        </svg>
        {unreadCount > 0 && (
            <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full top-0 start-3 dark:border-gray-900"></div>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-20 w-80 max-w-sm bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-800 dark:divide-gray-700 mt-2" aria-labelledby="dropdownNotificationButton">
          <div className="block px-4 py-2 font-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">
              Notifications
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No notifications
                </div>
            ) : (
                notifications.map((notification) => (
                    <a key={notification.id} href="#" className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="shrink-0 relative">
                        <img className="rounded-full w-11 h-11" src={notification.avatar || "https://flowbite.com/docs/images/people/profile-picture-1.jpg"} alt="avatar" />
                        {getIcon(notification.type)}
                    </div>
                    <div className="w-full ps-3">
                        <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">{notification.title}</span>: {notification.message}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">{notification.time}</div>
                    </div>
                    </a>
                ))
            )}
          </div>
          <a href="#" className="block py-2 text-sm font-medium text-center text-gray-900 rounded-b-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
            <div className="inline-flex items-center ">
              <svg className="w-4 h-4 me-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
              </svg>
                View all
            </div>
          </a>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
