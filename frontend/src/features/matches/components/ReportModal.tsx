import React, { useState } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Checkbox, Label } from 'flowbite-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Change here: we now expect an array of strings
  onSubmit: (reasons: string[]) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  // State becomes an empty array initially
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const reportReasons = [
    "Fake profile",
    "Inappropriate content",
    "Harassment",
    "Spam",
    "Underage",
    "Other"
  ];

  const handleCheckboxChange = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedReasons);
    setSelectedReasons([]);
    onClose();
  };

  return (
    <Modal className="z-tiny-modal" show={isOpen} onClose={onClose} size="sm">
      <ModalHeader>Report User</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Please select one or more reasons for reporting:
          </p>
          <div className="flex flex-col gap-3">
            {reportReasons.map((reason) => (
              <div key={reason} className="flex items-center gap-2">
                <Checkbox
                  id={`reason-${reason}`}
                  value={reason}
                  checked={selectedReasons.includes(reason)}
                  onChange={() => handleCheckboxChange(reason)}
                />
                <Label htmlFor={`reason-${reason}`} className="cursor-pointer">
                  {reason}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button 
            onClick={handleSubmit} 
            disabled={selectedReasons.length === 0}
        >
          Submit Report ({selectedReasons.length})
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReportModal;