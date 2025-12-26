import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ children, className = '', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';
  
  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
