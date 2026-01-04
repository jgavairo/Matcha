import React, { useState } from 'react';
import AppDrawer from '../../../components/ui/AppDrawer';
import { UserProfile } from '@app-types/user';
import ReportModal from './ReportModal';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';

interface UserProfileModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  onDislike: () => void;
  onBlock: () => void;
  onReport: (reason: string) => void;
  showPassButton?: boolean;
  hideActions?: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onLike, 
  onDislike, 
  onBlock, 
  onReport,
  showPassButton = false,
  hideActions = false
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleReportSubmit = (reason: string) => {
    onReport(reason);
    setIsReportModalOpen(false);
  };

  return (
    <>
      <AppDrawer isOpen={isOpen} onClose={onClose}>
        {user && (
          <div className="h-full overflow-y-auto bg-white dark:bg-gray-800">
            <div className="min-h-full flex flex-col">
              <ProfileHeader 
                user={user} 
                onClose={onClose} 
                onBlock={onBlock} 
                onReportClick={() => setIsReportModalOpen(true)} 
                hideActions={hideActions}
              />

              <ProfileInfo 
                user={user} 
                onLike={onLike}
                onDislike={onDislike}
                showPassButton={showPassButton}
                hideActions={hideActions}
              />
            </div>
          </div>
        )}
      </AppDrawer>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSubmit={handleReportSubmit} 
      />
    </>
  );
};

export default UserProfileModal;
