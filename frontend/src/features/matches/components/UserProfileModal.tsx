import React, { useState } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Badge, Tooltip, Dropdown, DropdownItem } from 'flowbite-react';
import { HiX, HiHeart, HiBan, HiFlag, HiChat, HiLocationMarker, HiStar, HiClock, HiDotsVertical } from 'react-icons/hi';
import { UserProfile } from '@app-types/user';
import ImageCarousel from './ImageCarousel';

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
  const [reportReason, setReportReason] = useState<string>('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleReportSubmit = () => {
    onReport(reportReason);
    setIsReportModalOpen(false);
    setReportReason('');
  };

  const reportReasons = [
    "Fake profile",
    "Inappropriate content",
    "Harassment",
    "Spam",
    "Underage",
    "Other"
  ];

  return (
    <>
      <Modal show={isOpen} onClose={onClose} size="4xl" position="center">
        <ModalHeader>
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2">
              {user.username}
              {user.isOnline ? (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              ) : (
                <span className="h-3 w-3 rounded-full bg-gray-400" title={`Last seen: ${user.lastConnection}`}></span>
              )}
            </div>
            <div className="mr-8">
              <Dropdown label="" renderTrigger={() => <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><HiDotsVertical className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>}>
                <DropdownItem onClick={onBlock} icon={HiBan} className="text-red-600 dark:text-red-500">
                  Block User
                </DropdownItem>
                <DropdownItem onClick={() => setIsReportModalOpen(true)} icon={HiFlag}>
                  Report
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Images */}
            <div className="h-96 md:h-[500px] w-full rounded-lg overflow-hidden shadow-lg">
              <ImageCarousel images={user.images} alt={user.username} />
            </div>

            {/* Right Column: Info */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {user.firstName} {user.lastName}
                    <span className="text-xl font-normal text-gray-500">, {user.age}</span>
                  </h2>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                    <HiLocationMarker className="w-4 h-4 mr-1" />
                    {user.distance} km away
                  </div>
                  <div className="flex items-center text-yellow-500 mt-1">
                    <HiStar className="w-4 h-4 mr-1" />
                    {user.fameRating} Fame Rating
                  </div>
                  {!user.isOnline && (
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <HiClock className="w-4 h-4 mr-1" />
                      Last seen: {user.lastConnection}
                    </div>
                  )}
                </div>
                
                {/* Status Badges */}
                <div className="flex flex-col gap-2 items-end">
                  {user.isMatch && (
                    <Badge color="purple" size="sm" icon={HiHeart}>It's a Match!</Badge>
                  )}
                  {user.hasLikedYou && !user.isMatch && (
                    <Badge color="pink" size="sm" icon={HiHeart}>Likes You</Badge>
                  )}
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">About</h3>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{user.biography}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</h4>
                    <p className="text-gray-900 dark:text-white capitalize">{user.gender}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Orientation</h4>
                    <p className="text-gray-900 dark:text-white capitalize">{user.sexualPreferences.join(', ')}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.tags.map((tag, index) => (
                      <Badge key={index} color="indigo" size="sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-6 flex flex-col gap-3">
                <div className="flex gap-3 justify-center">
                  <Button 
                    color="failure" 
                    pill 
                    size="xl"
                    onClick={onDislike}
                    className="w-16 h-16 flex items-center justify-center"
                  >
                    <HiX className="w-8 h-8" />
                  </Button>
                  <Button 
                    color="success" 
                    pill 
                    size="xl"
                    onClick={onLike}
                    className="w-16 h-16 flex items-center justify-center"
                  >
                    <HiHeart className="w-8 h-8" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Report Modal */}
      <Modal show={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} size="sm">
        <ModalHeader>Report User</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Please select a reason for reporting this user:
            </p>
            <div className="flex flex-col gap-2">
              {reportReasons.map((reason) => (
                <div key={reason} className="flex items-center">
                  <input 
                    id={`reason-${reason}`} 
                    type="radio" 
                    value={reason} 
                    name="report-reason" 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                  <label htmlFor={`reason-${reason}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {reason}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleReportSubmit} disabled={!reportReason}>Submit Report</Button>
          <Button color="gray" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserProfileModal;
