import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
        <span className="block xl:inline">Find your perfect</span>{' '}
        <span className="block text-pink-600 xl:inline">Match</span>
      </h1>
      <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        Join the community of millions of people looking for love. Swipe, match, chat and meet new people in your area.
      </p>
      <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
        <div className="rounded-md shadow">
          <a href="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 md:py-4 md:text-lg md:px-10">
            Get started
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
