import { db } from '../utils/db';

export const createNotification = async (recipientId: number, type: string, message: string, senderId?: number) => {
    const query = `
        INSERT INTO notifications (recipient_id, sender_id, type, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const result = await db.query(query, [recipientId, senderId, type, message]);
    return result.rows[0];
};

export const getNotifications = async (userId: number) => {
    const query = `
        SELECT 
            n.*,
            u.username as sender_username,
            (SELECT url FROM images WHERE user_id = u.id AND is_profile_picture = TRUE LIMIT 1) as sender_avatar
        FROM notifications n
        LEFT JOIN users u ON n.sender_id = u.id
        WHERE n.recipient_id = $1
        ORDER BY n.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

export const markNotificationAsRead = async (notificationId: number, userId: number) => {
    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1 AND recipient_id = $2
        RETURNING *
    `;
    const result = await db.query(query, [notificationId, userId]);
    return result.rows[0];
};

export const markAllNotificationsAsRead = async (userId: number) => {
    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE recipient_id = $1
    `;
    await db.query(query, [userId]);
};

export const deleteNotification = async (notificationId: number, userId: number) => {
    const query = `
        DELETE FROM notifications
        WHERE id = $1 AND recipient_id = $2
        RETURNING id
    `;
    const result = await db.query(query, [notificationId, userId]);
    return result.rowCount ? result.rowCount > 0 : false;
};

export const deleteAllNotifications = async (userId: number) => {
    const query = `
        DELETE FROM notifications
        WHERE recipient_id = $1
    `;
    await db.query(query, [userId]);
};
