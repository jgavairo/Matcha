import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '@components/layout/BottomNav';
import Header from '@components/layout/Header';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Header />
      <div id="app-scroll-container" className="flex-1 overflow-y-auto scroll-smooth flex flex-col relative">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
