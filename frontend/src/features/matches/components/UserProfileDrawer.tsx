import React, { useState, useEffect } from 'react';
import AppDrawer from '@components/ui/AppDrawer';
import { UserProfile } from '@app-types/user';
import ReportModal from './ReportModal';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import { api } from '@services/api';

interface UserProfileModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  onDislike: () => void;
  onUnlike?: () => void;
  onBlock: () => void;
  onReport: (reasons: string[]) => void | Promise<void>;
  showPassButton?: boolean;
  hideActions?: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onLike, 
  onDislike, 
  onUnlike,
  onBlock, 
  onReport,
  showPassButton = false,
  hideActions = false
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      const recordView = async () => {
        try {
          await api.post(`/users/view/${user.id}`);
        } catch (error) {
          console.error("Failed to record view", error);
        }
      };
      recordView();
    }
  }, [isOpen, user?.id]);

  // Fermer le ReportModal quand le drawer se ferme
  useEffect(() => {
    if (!isOpen) {
      setIsReportModalOpen(false);
    }
  }, [isOpen]);

  const handleReportSubmit = (reasons: string[]) => {
    onReport(reasons);
    setIsReportModalOpen(false);
  };

  const handleDrawerClose = () => {
    setIsReportModalOpen(false);
    onClose();
  };

  return (
    <>
      <AppDrawer isOpen={isOpen} onClose={handleDrawerClose}>
        {user && (
          <div className="h-full overflow-y-auto bg-white dark:bg-gray-800">
            <div className="min-h-full flex flex-col">
              <ProfileHeader 
                user={user} 
                onClose={handleDrawerClose} 
                onBlock={onBlock} 
                onReportClick={() => setIsReportModalOpen(true)} 
                hideActions={hideActions}
              />

              <ProfileInfo 
                user={user} 
                onLike={onLike}
                onDislike={onDislike}
                onUnlike={onUnlike}
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
