import React from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from '@components/layout/AppHeader';
import BottomNav from '@components/layout/BottomNav';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      
      <main className="flex-grow flex flex-col mt-14 mb-16 overflow-y-auto">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default AppLayout;
