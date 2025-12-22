import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';

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
      <div className="mt-5 flex justify-center md:mt-8">
        <Link to="/register">
          <Button color="pink" size="lg">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
