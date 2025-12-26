import React from 'react';
import { Outlet } from 'react-router-dom';

const AppLayout: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col">
      <Outlet />
    </div>
  );
};

export default AppLayout;
