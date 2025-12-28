import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="flex-grow overflow-y-auto scroll-smooth w-full">
      <div className="w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
