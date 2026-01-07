import React from 'react';
import { Button, Toast, ToastToggle } from "flowbite-react";
import { HiPhoneIncoming, HiPhone, HiX } from "react-icons/hi";

interface IncomingCallToastProps {
    callerName: string;
    callerAvatar?: string;
    onAnswer: () => void;
    onDecline: () => void;
}

export const IncomingCallToast: React.FC<IncomingCallToastProps> = ({ 
    callerName, 
    callerAvatar, 
    onAnswer, 
    onDecline 
}) => {
  return (
    <div className="fixed top-4 right-4 z-[70]">
        <Toast>
        <div className="flex items-start">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300">
            {callerAvatar ? (
                 <img src={callerAvatar} alt={callerName} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
                <HiPhoneIncoming className="h-5 w-5" />
            )}
            </div>
            <div className="ml-3 text-sm font-normal">
            <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{callerName} is calling...</span>
            <div className="mb-2 text-sm font-normal">Incoming video call</div>
            <div className="flex gap-2">
                <div className="w-auto">
                <Button size="xs" color="success" onClick={onAnswer}>
                    <HiPhone className="mr-1 h-3 w-3" />
                    Answer
                </Button>
                </div>
                <div className="w-auto">
                <Button color="failure" size="xs" onClick={onDecline}>
                    <HiX className="mr-1 h-3 w-3" />
                    Decline
                </Button>
                </div>
            </div>
            </div>
            <ToastToggle onDismiss={onDecline} />
        </div>
        </Toast>
    </div>
  );
};
