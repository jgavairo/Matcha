import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'flowbite-react';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="xl" color="pink" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user && user.statusId !== 2 && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  if (user && user.statusId === 2 && location.pathname === '/complete-profile') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
