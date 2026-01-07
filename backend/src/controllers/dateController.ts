import { Request, Response } from 'express';
import * as dateModel from '../models/dateModel';
import * as chatModel from '../models/chatModel';
import { getIO } from '../config/socket';

export const proposeDate = async (req: Request, res: Response) => {
    try {
        const senderId = (req as any).user.id;
        const { receiverId, dateTime, location, description } = req.body;

        const date = await dateModel.createDate(senderId, receiverId, dateTime, location, description);

        const io = getIO();
        io.to(`user_${receiverId}`).emit('notification', {
            type: 'date_proposed',
            message: `New date proposal`,
            data: date
        });
        
        // System Message
        const conversationId = await chatModel.getConversationIdByUsers(senderId, receiverId);
        if (conversationId) {
            const message = await chatModel.createMessage(conversationId, null, `Date proposed: ${location} on ${new Date(dateTime).toLocaleString()}`, 'system');
            io.to(`user_${senderId}`).emit('chat_message', message);
            io.to(`user_${receiverId}`).emit('chat_message', message);
        }

        io.to(`user_${receiverId}`).emit('date_updated', date);
        io.to(`user_${senderId}`).emit('date_updated', date);

        res.status(201).json(date);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error proposing date' });
    }
};

export const getDates = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { targetUserId } = req.params;
        // Simplified: only return the latest active or pending date for the "Single Event" logic
        const dates = await dateModel.getDatesBetweenUsers(userId, parseInt(targetUserId));
        // Filter in memory for simplicity or update model: take the most recent that isn't cancelled/declined or just the top one
        // User wants "one single event at a time", implying we should likely just show the active one.
        const activeDate = dates.filter((d: any) => ['pending', 'accepted'].includes(d.status))[0] || null;
        
        res.json(activeDate ? [activeDate] : []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dates' });
    }
};

export const updateDateStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { status } = req.body; // accepted or declined

        const date = await dateModel.getDateById(parseInt(id));
        if (!date) return res.status(404).json({ message: 'Date not found' });

        if (date.receiver_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to respond to this date' });
        }

        const updated = await dateModel.updateDate(parseInt(id), { status });
        
        const io = getIO();
        io.to(`user_${date.sender_id}`).emit('notification', {
            type: `date_${status}`,
            message: `Date proposal ${status}`,
            data: updated
        });

        // System Message
        const conversationId = await chatModel.getConversationIdByUsers(date.sender_id, userId);
        if (conversationId) {
            const msgContent = status === 'accepted' ? `Date accepted!` : `Date declined.`;
            const message = await chatModel.createMessage(conversationId, null, msgContent, 'system');
            io.to(`user_${date.sender_id}`).emit('chat_message', message);
            io.to(`user_${userId}`).emit('chat_message', message);
        }

        io.to(`user_${date.sender_id}`).emit('date_updated', updated);
        io.to(`user_${userId}`).emit('date_updated', updated);

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating date status' });
    }
};

export const modifyDate = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { dateTime, location, description } = req.body;

        const date = await dateModel.getDateById(parseInt(id));
        if (!date) return res.status(404).json({ message: 'Date not found' });

        // Logic: The modifier becomes the sender, the OTHER person becomes receiver
        const newReceiverId = (date.sender_id === userId) ? date.receiver_id : date.sender_id;

        const updated = await dateModel.updateDate(parseInt(id), {
            sender_id: userId,
            receiver_id: newReceiverId,
            date_time: dateTime,
            location,
            description,
            status: 'pending'
        });

        const io = getIO();
        io.to(`user_${newReceiverId}`).emit('notification', {
            type: 'date_modified',
            message: `Date proposal modified`,
            data: updated
        });

        // System Message
        const conversationId = await chatModel.getConversationIdByUsers(userId, newReceiverId);
        if (conversationId) {
            const message = await chatModel.createMessage(conversationId, null, `Date modified: ${location} on ${new Date(dateTime).toLocaleString()}`, 'system');
            io.to(`user_${userId}`).emit('chat_message', message);
            io.to(`user_${newReceiverId}`).emit('chat_message', message);
        }

        io.to(`user_${newReceiverId}`).emit('date_updated', updated);
        io.to(`user_${userId}`).emit('date_updated', updated);

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error modifying date' });
    }
};

export const cancelDate = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        const date = await dateModel.getDateById(parseInt(id));
        if (!date) return res.status(404).json({ message: 'Date not found' });

        if (date.sender_id !== userId && date.receiver_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updated = await dateModel.updateDate(parseInt(id), { status: 'cancelled' });
        const partnerId = date.sender_id === userId ? date.receiver_id : date.sender_id;

        const io = getIO();
        
        // System Message
        const conversationId = await chatModel.getConversationIdByUsers(userId, partnerId);
        if (conversationId) {
            const message = await chatModel.createMessage(conversationId, null, `Date cancelled`, 'system');
            io.to(`user_${userId}`).emit('chat_message', message);
            io.to(`user_${partnerId}`).emit('chat_message', message);
        }

        io.to(`user_${partnerId}`).emit('date_updated', updated);
        io.to(`user_${userId}`).emit('date_updated', updated);

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error cancelling date' });
    }
};
