import React from 'react';
import { Conversation } from '../services/chatService';
import AppDrawer from '@components/ui/AppDrawer';
import ChatWindow from './ChatWindow';

interface ChatDrawerProps {
    conversation: Conversation | null;
    currentUserId: number;
    isOpen: boolean;
    onClose: () => void;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ conversation, currentUserId, isOpen, onClose }) => {
    return (
        <AppDrawer isOpen={isOpen} onClose={onClose}>
            <ChatWindow 
                conversation={conversation} 
                currentUserId={currentUserId} 
                onClose={onClose}
            />
        </AppDrawer>
    );
};

export default ChatDrawer;

