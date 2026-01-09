import React from 'react';
import { Toast, ToastToggle } from "flowbite-react";
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
    <div className="fixed top-4 right-4 z-[70] animate-slide-in-right">
        <Toast className="min-w-[320px] shadow-2xl">
        <div className="flex items-start gap-3">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white ring-4 ring-green-200 dark:ring-green-800 animate-pulse">
            {callerAvatar ? (
                 <img src={callerAvatar} alt={callerName} className="h-12 w-12 rounded-full object-cover ring-2 ring-white" />
            ) : (
                <HiPhoneIncoming className="h-6 w-6" />
            )}
            </div>
            <div className="flex-1 min-w-0">
            <div className="mb-1 text-base font-bold text-gray-900 dark:text-white truncate">{callerName}</div>
            <div className="mb-3 text-sm font-normal text-gray-600 dark:text-gray-400">Incoming video call</div>
            <div className="flex gap-3">
                <button
                    onClick={onAnswer}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95 ring-2 ring-green-300 dark:ring-green-700"
                >
                    <HiPhone className="h-5 w-5" />
                    <span>Answer</span>
                </button>
                <button
                    onClick={onDecline}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95 ring-2 ring-red-300 dark:ring-red-700"
                >
                    <HiX className="h-5 w-5" />
                    <span>Decline</span>
                </button>
            </div>
            </div>
            <ToastToggle onDismiss={onDecline} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
        </div>
        </Toast>
    </div>
  );
};
