import { Request, Response } from 'express';
import * as chatModel from '../models/chatModel';
import * as matchModel from '../models/matchModel';
import { getIO } from '../config/socket';
import { getUserById } from '../models/userModel';

export const getConversations = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const conversations = await chatModel.getConversations(userId);
        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const conversationId = parseInt(req.params.id);
        const messages = await chatModel.getMessages(conversationId, userId);
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const uploadFiles = async (req: Request, res: Response) => {
    try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const files = req.files as Express.Multer.File[];
        const urls = files.map(file => `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${file.filename}`);

        res.json({ urls });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const conversationId = parseInt(req.params.id);
        const { content } = req.body;
        const message = await chatModel.createMessage(conversationId, userId, content);

        const participants = await chatModel.getConversationParticipants(conversationId);
        if (participants) {
            const io = getIO();
            const recipientId = participants.user_id_1 === userId ? participants.user_id_2 : participants.user_id_1;
            
            console.log(`Sending message from ${userId} to ${recipientId}`);
            console.log(`Emitting to rooms: user_${userId}, user_${recipientId}`);

            io.to(`user_${recipientId}`).emit('chat_message', message);
            io.to(`user_${userId}`).emit('chat_message', message);

            // Notify recipient
            const sender = await getUserById(userId);
            if (sender) {
                io.to(`user_${recipientId}`).emit('notification', {
                    type: 'message',
                    message: `New message from ${sender.username}`,
                    senderId: userId,
                    senderUsername: sender.username,
                    avatar: sender.images[0]
                });
            }
        }

        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const conversationId = parseInt(req.params.id);
        await chatModel.markMessagesAsRead(conversationId, userId);

        const participants = await chatModel.getConversationParticipants(conversationId);
        if (participants) {
            const io = getIO();
            const recipientId = participants.user_id_1 === userId ? participants.user_id_2 : participants.user_id_1;
            
            io.to(`user_${recipientId}`).emit('messages_read', { conversationId, readerId: userId });
            io.to(`user_${userId}`).emit('messages_read', { conversationId, readerId: userId });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// For testing purposes
export const createMatch = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { targetUserId } = req.body;
        const match = await matchModel.createMatch(userId, targetUserId);
        res.json(match);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
