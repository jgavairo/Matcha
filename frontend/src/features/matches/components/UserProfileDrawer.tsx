import React, { useState } from 'react';
import { Drawer } from 'flowbite-react';
import { UserProfile } from '@app-types/user';
import ReportModal from './ReportModal';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import ProfileFooter from './ProfileFooter';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  onDislike: () => void;
  onBlock: () => void;
  onReport: (reason: string) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onLike, 
  onDislike, 
  onBlock, 
  onReport 
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleReportSubmit = (reason: string) => {
    onReport(reason);
    setIsReportModalOpen(false);
  };

  return (
    <>
      <Drawer 
        open={isOpen} 
        onClose={onClose} 
        position="right" 
        className="w-full md:w-[600px] p-0 fixed top-16 bottom-16 h-auto !z-40 shadow-xl border-l border-gray-200 dark:border-gray-700"
        backdrop={false}
      >
        <div className="h-full flex flex-col bg-white dark:bg-gray-800">
          <ProfileHeader 
            user={user} 
            onClose={onClose} 
            onBlock={onBlock} 
            onReportClick={() => setIsReportModalOpen(true)} 
          />

          <ProfileInfo user={user} />

          <ProfileFooter onLike={onLike} onDislike={onDislike} />
        </div>
      </Drawer>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSubmit={handleReportSubmit} 
      />
    </>
  );
};

export default UserProfileModal;
