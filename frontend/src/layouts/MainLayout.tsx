import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow flex flex-col">
      <Outlet />
    </div>
  );
};

export default MainLayout;
