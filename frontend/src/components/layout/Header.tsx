import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiLogout, HiMoon, HiSun } from 'react-icons/hi';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import { useNotification } from '@context/NotificationContext';
import { Button } from 'flowbite-react';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    addToast("Are you sure you want to log out?", 'warning', 0, {
      title: "Confirm Logout",
      actions: [
        { 
          label: "Logout", 
          onClick: () => { 
            logout(); 
            navigate('/'); 
          }, 
          color: "failure" 
        },
        { 
          label: "Cancel", 
          onClick: () => {}, 
          color: "light" 
        }
      ]
    });
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 dark:bg-gray-800 dark:border-gray-700 w-full z-20 h-16 flex-none flex items-center">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl w-full">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-500">Matcha</span>
          </Link>
          <div className="flex items-center lg:order-2 gap-2">
            <button 
              onClick={toggleTheme}
              type="button" 
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 mr-1"
            >
              {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
              <span className="sr-only">Toggle theme</span>
            </button>

            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                type="button" 
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 mr-1"
              >
                <HiLogout className="w-5 h-5" />
                <span className="sr-only">Logout</span>
              </button>
            ) : (
              <>
                <Link to="/login">
                  <Button color="gray" size="sm">
                    Login
                  </Button>
                </Link>
                
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
  );
};

export default Header;
