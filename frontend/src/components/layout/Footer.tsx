import React from 'react';
import { useAuth } from '@context/AuthContext';
import BottomNav from './BottomNav';

const PublicFooter: React.FC = () => (
  <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
        &copy; 2025 Matcha. All rights reserved.
      </p>
    </div>
  </footer>
);

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
        <BottomNav />
    );
  }

  return <PublicFooter />;
};

export default Footer;
