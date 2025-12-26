import React from 'react';
import { HiMail, HiHeart, HiUserAdd, HiInformationCircle } from 'react-icons/hi';
import { NotificationItem as NotificationItemType } from '@context/NotificationContext';

interface NotificationItemProps {
  notification: NotificationItemType;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-blue-600 border border-white rounded-full dark:border-gray-800"><HiMail className="w-3 h-3 text-white" /></div>;
      case 'like':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-red-600 border border-white rounded-full dark:border-gray-800"><HiHeart className="w-3 h-3 text-white" /></div>;
      case 'match':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-purple-600 border border-white rounded-full dark:border-gray-800"><HiUserAdd className="w-3 h-3 text-white" /></div>;
      case 'system':
      default:
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-gray-600 border border-white rounded-full dark:border-gray-800"><HiInformationCircle className="w-3 h-3 text-white" /></div>;
    }
  };

  return (
    <a href="#" className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
      <div className="shrink-0 relative">
        <img className="rounded-full w-11 h-11" src={notification.avatar || "https://flowbite.com/docs/images/people/profile-picture-1.jpg"} alt="avatar" />
        {getIcon(notification.type)}
      </div>
      <div className="w-full ps-3">
        <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">{notification.title}</span>: {notification.message}
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-500">{notification.time}</div>
      </div>
    </a>
  );
};

export default NotificationItem;
