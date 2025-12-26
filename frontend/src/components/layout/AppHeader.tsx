import React from 'react';
import { Link } from 'react-router-dom';
import { HiLogout, HiMoon, HiSun } from 'react-icons/hi';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';

const AppHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 fixed w-full z-20 top-0 left-0">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link to="/app" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white text-primary-600">Matcha</span>
          </Link>
          <div className="flex items-center lg:order-2">
            <button 
              onClick={toggleTheme}
              type="button" 
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 mr-1"
            >
              {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
              <span className="sr-only">Toggle theme</span>
            </button>
            <button 
              onClick={logout}
              type="button" 
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 mr-1"
            >
              <HiLogout className="w-5 h-5" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </div>
      </nav>
  );
};

export default AppHeader;
