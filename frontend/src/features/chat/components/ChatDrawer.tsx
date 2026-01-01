import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, chatService } from '../services/chatService';

interface ChatDrawerProps {
    conversation: Conversation | null;
    currentUserId: number;
    isOpen: boolean;
    onClose: () => void;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ conversation, currentUserId, isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (conversation && isOpen) {
            loadMessages();
            // Mark as read
            chatService.markAsRead(conversation.id);
        }
    }, [conversation, isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        if (!conversation) return;
        try {
            const msgs = await chatService.getMessages(conversation.id);
            setMessages(msgs);
        } catch (error) {
            console.error('Failed to load messages', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!conversation || !newMessage.trim()) return;

        try {
            const msg = await chatService.sendMessage(conversation.id, newMessage);
            setMessages([...messages, msg]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    if (!isOpen || !conversation) return null;

    const otherUsername = conversation.user1_id === currentUserId ? conversation.user2_username : conversation.user1_username;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            
            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold">{otherUsername}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 shadow'}`}>
                                    <p>{msg.content}</p>
                                    <span className={`text-xs block mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t bg-white">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatDrawer;
