import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiSparkles, HiChat, HiSearch, HiBell, HiUser } from 'react-icons/hi';
import { useNotification } from '@context/NotificationContext';
import NotificationDropdown from '@features/notifications/components/NotificationDropdown';

const BottomNav: React.FC = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotification();
  const location = useLocation();

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

  const isActive = (path: string) => location.pathname === path;

  const getItemClass = (active: boolean) => 
    `inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group ${active ? 'bg-gray-50 dark:bg-gray-800' : ''}`;

  const getIconClass = (active: boolean) => 
    `w-6 h-6 mb-1 ${active ? 'text-primary-600 dark:text-primary-500' : 'text-gray-500 dark:text-gray-400'} group-hover:text-primary-600 dark:group-hover:text-primary-500`;

  const getTextClass = (active: boolean) => 
    `text-xs ${active ? 'text-primary-600 dark:text-primary-500' : 'text-gray-500 dark:text-gray-400'} group-hover:text-primary-600 dark:group-hover:text-primary-500`;

  return (
      <footer className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600" ref={notificationRef}>
        {/* Notification Dropdown (Dropup) */}
        {isNotificationsOpen && <NotificationDropdown />}

        <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
          
          {/* Discover (Home) */}
          <Link to="/" className={getItemClass(isActive('/'))}>
            <HiSparkles className={getIconClass(isActive('/'))} />
            <span className={getTextClass(isActive('/'))}>Discover</span>
          </Link>

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
          <Link to="/chat" className={getItemClass(isActive('/chat'))}>
            <HiChat className={getIconClass(isActive('/chat'))} />
            <span className={getTextClass(isActive('/chat'))}>Chat</span>
          </Link>

          {/* Search (Matches?) - Keeping as Search for now but linking to matches as placeholder */}
          <Link to="/matches" className={getItemClass(isActive('/matches'))}>
            <HiSearch className={getIconClass(isActive('/matches'))} />
            <span className={getTextClass(isActive('/matches'))}>Search</span>
          </Link>

          {/* Profile */}
          <Link to="/profile" className={getItemClass(isActive('/profile'))}>
            {/* Using HiUser as fallback if image fails or just as icon, but keeping image for now if preferred. 
                Actually, let's use the icon for consistency or the image. 
                The previous code used an image. I'll switch to HiUser for consistency with the icon set, 
                or keep the image if the user really wants it. 
                Let's use HiUser for now to match the style, it's cleaner. */}
            <HiUser className={getIconClass(isActive('/profile'))} />
            <span className={getTextClass(isActive('/profile'))}>Profile</span>
          </Link>
        </div>
      </footer>
  );
};

export default BottomNav;
