import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiSparkles, HiChat, HiSearch, HiBell, HiUser } from 'react-icons/hi';
import { useNotification } from '@context/NotificationContext';
import { useChatContext } from '@context/ChatContext';
import NotificationDropdown from '@features/notifications/components/NotificationDropdown';

const BottomNav: React.FC = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { unreadCount: unreadNotifCount } = useNotification();
  const { unreadCount: unreadChatCount } = useChatContext();
  const location = useLocation();

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // Close notifications on route change
  useEffect(() => {
    setIsNotificationsOpen(false);
  }, [location.pathname]);

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

  const isActive = (path: string) => location.pathname === path;

  const getItemClass = (active: boolean) => 
    `inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group ${active ? 'bg-gray-50 dark:bg-gray-800' : ''}`;

  const getIconClass = (active: boolean) => 
    `w-7 h-7 ${active ? 'text-primary-600 dark:text-primary-500' : 'text-gray-500 dark:text-gray-400'} group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors duration-200`;

  return (
      <footer className="z-bottom-nav w-full h-16 flex-none" ref={notificationRef}>
        {/* Notification Dropdown (Dropup) */}
        <NotificationDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

        <div className="relative z-bottom-nav w-full h-full bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
          <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
          
          {/* Discover (Home) */}
          <Link to="/" className={getItemClass(isActive('/'))}>
            <HiSparkles className={getIconClass(isActive('/'))} />
          </Link>

          {/* Notifications (With Badge) */}
          <button 
            type="button" 
            onClick={toggleNotifications}
            className={getItemClass(isNotificationsOpen)}
          >
            <div className="relative inline-flex items-center">
              <HiBell className={getIconClass(isNotificationsOpen)} />
              {unreadNotifCount > 0 && (
                <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full top-0 start-4 dark:border-gray-700"></div>
              )}
            </div>
          </button>

          {/* Chat */}
          <Link to="/chat" className={getItemClass(isActive('/chat'))}>
            <div className="relative inline-flex items-center">
              <HiChat className={getIconClass(isActive('/chat'))} />
              {unreadChatCount > 0 && (
                <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full top-0 start-4 dark:border-gray-700"></div>
              )}
            </div>
          </Link>

          {/* Search */}
          <Link to="/search" className={getItemClass(isActive('/search'))}>
            <HiSearch className={getIconClass(isActive('/search'))} />
          </Link>

          {/* Profile */}
          <Link to="/profile" className={getItemClass(isActive('/profile'))}>
            <HiUser className={getIconClass(isActive('/profile'))} />
          </Link>
        </div>
        </div>
      </footer>
  );
};

export default BottomNav;
