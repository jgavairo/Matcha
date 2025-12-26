import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 text-center">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome to Matcha</h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            This is your main dashboard. Content will appear here.
          </p>
          <div className="h-64 bg-gray-200 rounded dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Content Placeholder</span>
          </div>
        </div>
    </div>
  );
};

export default DashboardPage;
