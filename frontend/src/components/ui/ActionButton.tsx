import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'warning';
  size?: 'lg' | 'xl';
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  variant = 'primary', 
  size = 'xl', 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = "rounded-full border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 shadow-sm active:scale-95";
  
  const variants = {
    primary: "border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-300 dark:border-primary-500 dark:text-primary-500 dark:hover:bg-primary-600",
    danger: "border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600",
    warning: "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-white focus:ring-yellow-200 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-500",
  };

  const sizes = {
    lg: "p-3",
    xl: "p-4",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ActionButton;
