import React, { useState } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'flowbite-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [reportReason, setReportReason] = useState<string>('');

  const reportReasons = [
    "Fake profile",
    "Inappropriate content",
    "Harassment",
    "Spam",
    "Underage",
    "Other"
  ];

  const handleSubmit = () => {
    onSubmit(reportReason);
    setReportReason('');
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="sm">
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
                  checked={reportReason === reason}
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
        <Button onClick={handleSubmit} disabled={!reportReason}>Submit Report</Button>
        <Button color="gray" onClick={onClose}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReportModal;
