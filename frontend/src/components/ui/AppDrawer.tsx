import React from 'react';
import { Drawer } from 'flowbite-react';

interface AppDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const AppDrawer: React.FC<AppDrawerProps> = ({ isOpen, onClose, children, className }) => {
    return (
        <Drawer 
            open={isOpen} 
            onClose={onClose} 
            position="right" 
            className={`w-full md:w-[600px] p-0 !m-0 fixed top-16 bottom-16 h-auto !z-modal border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${className || ''}`}
            backdrop={true}
        >
            {children}
        </Drawer>
    );
};

export default AppDrawer;
