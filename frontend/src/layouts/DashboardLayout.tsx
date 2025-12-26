import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from '../components/ui/DashboardHeader';
import BottomNav from '../components/ui/BottomNav';

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <main className="flex-grow flex flex-col mt-14 mb-16 overflow-y-auto">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
