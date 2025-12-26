import React, { useState, useRef, useEffect } from 'react';
import { HiHome, HiChat, HiSearch, HiBell } from 'react-icons/hi';
import { useNotification } from '@context/NotificationContext';
import NotificationDropdown from '@features/notifications/components/NotificationDropdown';

const BottomNav: React.FC = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotification();

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
      <footer className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600" ref={notificationRef}>
        {/* Notification Dropdown (Dropup) */}
        {isNotificationsOpen && <NotificationDropdown />}

        <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
          
          {/* Home (Active) */}
          <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
            <HiHome className="w-6 h-6 mb-1 text-primary-600 dark:text-primary-500 group-hover:text-primary-600 dark:group-hover:text-primary-500" />
            <span className="text-xs text-primary-600 dark:text-primary-500 group-hover:text-primary-600 dark:group-hover:text-primary-500">Home</span>
          </button>

          {/* Notifications (With Badge) */}
          <button 
            type="button" 
            onClick={toggleNotifications}
            className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group relative ${isNotificationsOpen ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <HiBell className={`w-6 h-6 mb-1 ${isNotificationsOpen ? 'text-primary-600 dark:text-primary-500' : 'text-gray-500 dark:text-gray-400'} group-hover:text-primary-600 dark:group-hover:text-primary-500`} />
            <span className={`text-xs ${isNotificationsOpen ? 'text-primary-600 dark:text-primary-500' : 'text-gray-500 dark:text-gray-400'} group-hover:text-primary-600 dark:group-hover:text-primary-500`}>Alerts</span>
            {unreadCount > 0 && (
                <div className="absolute inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full top-2 right-3 dark:border-gray-900">{unreadCount}</div>
            )}
          </button>

          {/* Chat */}
          <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
            <HiChat className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500">Chat</span>
          </button>

          {/* Search (Modal Trigger) */}
          <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
            <HiSearch className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500">Search</span>
          </button>

          {/* Profile (Avatar) */}
          <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
            <img className="w-6 h-6 rounded-full mb-1" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="Profile"/>
            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500">Profile</span>
          </button>
        </div>
      </footer>
  );
};

export default BottomNav;
