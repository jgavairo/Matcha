import { Request, Response } from 'express';
import { getNotifications, markNotificationAsRead, deleteNotification, deleteAllNotifications, markAllNotificationsAsRead } from '../models/notificationModel';

export const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const notifications = await getNotifications(userId);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const notificationId = parseInt(req.params.id);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        await markNotificationAsRead(notificationId, userId);
        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        await markAllNotificationsAsRead(userId);
        res.status(200).json({ message: 'Marked all as read' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const removeNotification = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const notificationId = parseInt(req.params.id);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        await deleteNotification(notificationId, userId);
        res.status(200).json({ message: 'Notification removed' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const clearNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        await deleteAllNotifications(userId);
        res.status(200).json({ message: 'Notifications cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
