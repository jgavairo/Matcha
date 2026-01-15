import React from 'react';
import { Dropdown, DropdownItem } from 'flowbite-react';
import { HiX, HiDotsVertical, HiBan, HiFlag } from 'react-icons/hi';
import { UserProfile } from '@app-types/user';

interface ProfileHeaderProps {
  user: UserProfile;
  onClose: () => void;
  onBlock: () => void;
  onReportClick: () => void;
  hideActions?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onClose, onBlock, onReportClick, hideActions = false }) => {
  const formatLastSeen = (dateString: string) => {
    if (!dateString) return 'Offline';
    try {
      return `Last seen: ${new Date(dateString).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } catch (e) {
      return 'Offline';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.username}</h2>
        {user.isOnline ? (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        ) : (
          <span className="h-3 w-3 rounded-full bg-gray-400" title={formatLastSeen(user.lastConnection)}></span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!hideActions && (
          <div className="relative z-modal">
            <Dropdown label="" renderTrigger={() => <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><HiDotsVertical className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>}>
              <DropdownItem onClick={onBlock} icon={HiBan} className="text-red-600 dark:text-red-500">
                Block User
              </DropdownItem>
              <DropdownItem onClick={onReportClick} icon={HiFlag}>
                Report
              </DropdownItem>
            </Dropdown>
          </div>
        )}
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
        >
          <HiX className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
