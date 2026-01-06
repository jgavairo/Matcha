import React, { useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useNotification } from '../../../context/NotificationContext';

const NotificationListener: React.FC = () => {
    const { socketService } = useSocket();
    const { addNotification } = useNotification();

    useEffect(() => {
        const handleNotification = (data: any) => {
            // Data structure from backend: { type, message, senderId, senderUsername, avatar }
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
    }, [socketService, addNotification]);

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
