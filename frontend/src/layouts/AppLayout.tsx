import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '@components/layout/BottomNav';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div id="app-scroll-container" className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
        <Outlet />
      </div>
      <div className="h-16 flex-none" /> {/* Spacer for fixed BottomNav */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
