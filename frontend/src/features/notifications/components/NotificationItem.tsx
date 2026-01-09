import React from 'react';
import { 
  HiMail, 
  HiHeart, 
  HiUserAdd, 
  HiInformationCircle, 
  HiEye, 
  HiThumbDown, 
  HiCheckCircle, 
  HiXCircle, 
  HiExclamation,
  HiX
} from 'react-icons/hi';
import { useNotification } from '@context/NotificationContext';
import { NotificationItem as NotificationItemType } from '@app-types/notifications';
import { formatTimeAgo } from '@utils/dateUtils';

interface NotificationItemProps {
  notification: NotificationItemType;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead, removeNotification } = useNotification();

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notification.id);
  };

  const getContent = (n: NotificationItemType) => {
    const senderName = n.sender || 'Someone';
    
    switch (n.type) {
      case 'like':
        return { title: 'New Like', message: `${senderName} liked your profile.` };
      case 'visit':
        return { title: 'Profile Visit', message: `${senderName} visited your profile.` };
      case 'message':
        return { title: 'New Message', message: n.message || 'You received a new message.' };
      case 'match':
        return { title: 'It\'s a Match!', message: `You and ${senderName} matched!` };
      case 'unlike':
        return { title: 'Lost Like', message: `${senderName} unliked your profile.` };
      case 'warning':
      case 'success':
      case 'error':
      case 'info':
      default:
        return { title: n.title || 'Notification', message: n.message || '' };
    }
  };

  const { title, message } = getContent(notification);

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-blue-600 border border-white rounded-full dark:border-gray-800"><HiMail className="w-3 h-3 text-white" /></div>;
      case 'like':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-red-600 border border-white rounded-full dark:border-gray-800"><HiHeart className="w-3 h-3 text-white" /></div>;
      case 'match':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-purple-600 border border-white rounded-full dark:border-gray-800"><HiUserAdd className="w-3 h-3 text-white" /></div>;
      case 'visit':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-yellow-500 border border-white rounded-full dark:border-gray-800"><HiEye className="w-3 h-3 text-white" /></div>;
      case 'unlike':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-gray-500 border border-white rounded-full dark:border-gray-800"><HiThumbDown className="w-3 h-3 text-white" /></div>;
      case 'success':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-green-500 border border-white rounded-full dark:border-gray-800"><HiCheckCircle className="w-3 h-3 text-white" /></div>;
      case 'error':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-red-500 border border-white rounded-full dark:border-gray-800"><HiXCircle className="w-3 h-3 text-white" /></div>;
      case 'warning':
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-orange-500 border border-white rounded-full dark:border-gray-800"><HiExclamation className="w-3 h-3 text-white" /></div>;
      case 'info':
      default:
        return <div className="absolute flex items-center justify-center w-5 h-5 ms-6 -mt-5 bg-blue-400 border border-white rounded-full dark:border-gray-800"><HiInformationCircle className="w-3 h-3 text-white" /></div>;
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-gray-700/50' : ''} group relative`}
    >
      <div className="shrink-0 relative">
        <img 
          className="rounded-full w-11 h-11 object-cover" 
          src={notification.avatar || `https://ui-avatars.com/api/?name=${notification.sender || 'User'}&background=random`} 
          alt="avatar" 
        />
        {getIcon(notification.type)}
      </div>
      <div className="w-full ps-3">
        <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400 pr-6">
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>: {message}
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-500">{formatTimeAgo(notification.time)}</div>
      </div>
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove notification"
      >
        <HiX className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationItem;
