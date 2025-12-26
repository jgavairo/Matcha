import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '@components/layout/BottomNav';

const AppLayout: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col pb-16">
      <Outlet />
      <BottomNav />
    </div>
  );
};

export default AppLayout;
