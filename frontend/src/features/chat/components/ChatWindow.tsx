import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, chatService } from '../services/chatService';
import { useFileDrop } from '../../../hooks/useFileDrop';

interface ChatWindowProps {
    conversation: Conversation | null;
    currentUserId: number;
    onClose?: () => void; // Optional, mainly for mobile to close the view
    className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, currentUserId, onClose, className = '' }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { isDragging, dragHandlers } = useFileDrop({
        onFileSelect: (file) => handleFileSelect(file),
        accept: 'image/*'
    });

    useEffect(() => {
        if (conversation) {
            loadMessages();
            // Mark as read
            chatService.markAsRead(conversation.id);
        } else {
            setMessages([]);
        }
    }, [conversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileSelect = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

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
        if (!conversation || (!newMessage.trim() && !selectedFile)) return;

        try {
            // TODO: Handle file upload in chatService
            // For now, we'll just send text if available
            if (newMessage.trim()) {
                const msg = await chatService.sendMessage(conversation.id, newMessage);
                setMessages([...messages, msg]);
                setNewMessage('');
            }
            
            // Reset file selection
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    if (!conversation) {
        return (
            <div className={`flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${className}`}>
                <p>Select a conversation to start chatting</p>
            </div>
        );
    }

    const otherUsername = conversation.user1_id === currentUserId ? conversation.user2_username : conversation.user1_username;

    return (
        <div 
            className={`flex flex-col h-full bg-white dark:bg-gray-800 relative ${isDragging ? 'ring-4 ring-blue-500 ring-inset' : ''} ${className}`}
            {...dragHandlers}
        >
            {isDragging && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500 bg-opacity-10 backdrop-blur-sm pointer-events-none">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
                        <svg className="w-12 h-12 mx-auto text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">Drop image to upload</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{otherUsername}</h2>
                {onClose && (
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-gray-900">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    const avatarUrl = `https://ui-avatars.com/api/?name=${isMe ? 'Me' : otherUsername}&background=random`;
                    
                    return (
                        <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <img className="w-8 h-8 rounded-full" src={avatarUrl} alt="User avatar" />
                            <div className="flex flex-col gap-1 w-full max-w-[320px]">
                                <div className={`flex items-center space-x-2 rtl:space-x-reverse ${isMe ? 'justify-end' : ''}`}>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {isMe ? 'You' : otherUsername}
                                    </span>
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`flex flex-col leading-1.5 p-4 border-gray-200 ${isMe ? 'bg-blue-100 dark:bg-blue-700 rounded-s-xl rounded-ee-xl' : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'}`}>
                                    <p className="text-sm font-normal text-gray-900 dark:text-white">
                                        {msg.content}
                                    </p>
                                </div>
                                <span className={`text-sm font-normal text-gray-500 dark:text-gray-400 ${isMe ? 'text-right' : ''}`}>
                                    {msg.is_read ? 'Read' : 'Delivered'}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t bg-white dark:bg-gray-800 dark:border-gray-700">
                {previewUrl && (
                    <div className="mb-4 relative inline-block">
                        <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded-lg border border-gray-200 dark:border-gray-600" />
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <label htmlFor="chat" className="sr-only">Your message</label>
                <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileInputChange} 
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
                    >
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2M12 4v12m0-12l-4 4m4-4l4 4"/>
                        </svg>
                        <span className="sr-only">Upload image</span>
                    </button>
                    <button type="button" className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 0 1-3-3V5a3 3 0 1 1 6 0v6a3 3 0 0 1-3 3Z"/>
                        </svg>
                        <span className="sr-only">Voice message</span>
                    </button>
                    <textarea 
                        id="chat" 
                        rows={1} 
                        className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none" 
                        placeholder="Your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                    ></textarea>
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim() && !selectedFile}
                        className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"/>
                        </svg>
                        <span className="sr-only">Send message</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
