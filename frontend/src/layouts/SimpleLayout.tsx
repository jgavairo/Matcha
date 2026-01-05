import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@components/layout/Header';

const SimpleLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col relative">
        <Outlet />
      </div>
    </div>
  );
};

export default SimpleLayout;

