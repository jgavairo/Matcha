import React, { useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useNotification } from '../../../context/NotificationContext';
import { useChatContext } from '../../../context/ChatContext';

const NotificationListener: React.FC = () => {
    const { socketService } = useSocket();
    const { addNotification } = useNotification();
    const { activeChatUserId } = useChatContext();

    useEffect(() => {
        const handleNotification = (data: any) => {
            // Data structure from backend: { type, message, senderId, senderUsername, avatar }
            
            // Don't show message notification if we are in chat with this user
            // Use loose equality or conversion to ensure type matching (string vs number)
            if (data.type === 'message' && activeChatUserId && (Number(activeChatUserId) === Number(data.senderId))) {
                return;
            }

            addNotification({
                type: data.type,
                title: getTitleByType(data.type),
                message: data.message,
                sender: data.senderUsername,
                avatar: data.avatar
            });
        };

        socketService.on('notification', handleNotification);

        return () => {
            socketService.off('notification', handleNotification);
        };
    }, [socketService, addNotification, activeChatUserId]);

    return null;
};

const getTitleByType = (type: string) => {
    switch (type) {
        case 'like': return 'New Like';
        case 'match': return 'It\'s a Match!';
        case 'visit': return 'Profile Visitor';
        case 'message': return 'New Message';
        case 'unlike': return 'Match Update';
        default: return 'Notification';
    }
};

export default NotificationListener;
