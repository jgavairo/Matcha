import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, chatService } from '../services/chatService';
import { useFileDrop } from '../../../hooks/useFileDrop';
import { useSocket } from '../../../context/SocketContext';
import { useCall } from '../../../context/CallContext';
import { useNotification } from '../../../context/NotificationContext';
import { HiCloudUpload } from 'react-icons/hi';

import ChatBubble from './ChatBubble';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import DatePlanner from './DatePlanner';

interface ChatWindowProps {
    conversation: Conversation | null;
    currentUserId: number;
    onClose?: () => void;
    className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, currentUserId, onClose, className = '' }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [otherUserStatus, setOtherUserStatus] = useState<{ isOnline: boolean; lastConnection: string }>({ isOnline: false, lastConnection: '' });
    const [showDatePlanner, setShowDatePlanner] = useState(false);
    
    // Call Context
    const { callUser } = useCall();
    const { addToast } = useNotification();
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { socketService } = useSocket();

    const { isDragging, dragHandlers } = useFileDrop({
        onFileSelect: (files) => handleFileSelect(files),
        accept: 'image/'
    });

    useEffect(() => {
        if (conversation) {
            loadMessages();
            chatService.markAsRead(conversation.id);
            
            // Set initial status
            const isUser1 = conversation.user1_id === currentUserId;
            setOtherUserStatus({
                isOnline: isUser1 ? conversation.user2_is_online : conversation.user1_is_online,
                lastConnection: isUser1 ? conversation.user2_last_connection : conversation.user1_last_connection
            });
            // Reset DatePlanner when conversation changes
            setShowDatePlanner(false);
        } else {
            setMessages([]);
        }
    }, [conversation]);

    useEffect(() => {
        if (!conversation) return;

        const handleMessage = (msg: Message) => {
            if (msg.conversation_id === conversation.id) {
                setMessages((prev) => [...prev, msg]);
                if (msg.sender_id !== currentUserId) {
                    chatService.markAsRead(conversation.id);
                }
            }
        };

        const handleMessagesRead = ({ conversationId, readerId }: { conversationId: number, readerId: number }) => {
            if (conversationId === conversation.id) {
                setMessages(prev => prev.map(msg => {
                    if (msg.sender_id !== readerId) {
                        return { ...msg, is_read: true };
                    }
                    return msg;
                }));
            }
        };
        
        const handleStatusChange = (data: { userId: number, isOnline: boolean, lastConnection: string }) => {
            const otherUserId = conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id;
            if (data.userId === otherUserId) {
                setOtherUserStatus(prev => ({
                    ...prev,
                    isOnline: data.isOnline,
                    lastConnection: data.lastConnection || prev.lastConnection
                }));
            }
        };

        socketService.on('chat_message', handleMessage);
        socketService.on('messages_read', handleMessagesRead);
        socketService.on('user_status_change', handleStatusChange);

        return () => {
            socketService.off('chat_message', handleMessage);
            socketService.off('messages_read', handleMessagesRead);
            socketService.off('user_status_change', handleStatusChange);
        };
    }, [conversation, socketService, currentUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const handleFileSelect = (files: File[]) => {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length > 0) {            if (selectedFiles.length + imageFiles.length > 10) {
                addToast('Maximum 10 files allowed', 'error');
                return;
            }            setSelectedFiles(prev => [...prev, ...imageFiles]);
            const newUrls = imageFiles.map(f => URL.createObjectURL(f));
            setPreviewUrls(prev => [...prev, ...newUrls]);
        }
    };

    const sendVoiceMessage = async (file: File) => {
        if (!conversation) return;
        try {
            const uploadedUrls = await chatService.uploadFiles([file]);
            const content = JSON.stringify({
                type: 'audio',
                url: uploadedUrls[0]
            });
            const msg = await chatService.sendMessage(conversation.id, content);
            setMessages(prev => [...prev, msg]);
        } catch (error) {
            console.error('Failed to send voice message', error);
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
        if (!conversation) return;

        // Don't send emptiness
        if (!newMessage.trim() && selectedFiles.length === 0) return;

        try {
            let uploadedUrls: string[] = [];
            if (selectedFiles.length > 0) {
                uploadedUrls = await chatService.uploadFiles(selectedFiles);
            }

            let msgContent = newMessage;
            // If we have images, construct JSON payload
            // If we have both Text and Images, we can send one message with JSON that includes text
            if (uploadedUrls.length > 0) {
                msgContent = JSON.stringify({
                    type: 'image',
                    text: newMessage.trim() || undefined,
                    urls: uploadedUrls
                });
            }

            const msg = await chatService.sendMessage(conversation.id, msgContent);
            setMessages([...messages, msg]);
            
            // Clean up preview URLs
            previewUrls.forEach(url => URL.revokeObjectURL(url));

            // Reset
            setNewMessage('');
            setSelectedFiles([]);
            setPreviewUrls([]);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    // Helper to remove selected file
    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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
                        <HiCloudUpload className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">Drop images to upload</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <ChatHeader 
                conversation={conversation}
                currentUserId={currentUserId}
                onCallUser={() => callUser(conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id, otherUsername, "")}
                onClose={onClose}
                isOnline={otherUserStatus.isOnline}
                lastConnection={otherUserStatus.lastConnection}
                onToggleDatePlanner={() => setShowDatePlanner(!showDatePlanner)}
            />

            <DatePlanner
                targetUserId={conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id}
                targetUsername={otherUsername}
                isOpen={showDatePlanner}
                onToggle={setShowDatePlanner}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-gray-900">
                {messages.map((msg) => {
                    return (
                        <ChatBubble 
                            key={msg.id}
                            message={msg}
                            isMe={msg.sender_id === currentUserId}
                            otherUsername={otherUsername}
                            onCopy={(content) => navigator.clipboard.writeText(content)}
                            onReply={(msg) => setNewMessage(`Replying to: "${msg.content.substring(0, 20)}..." `)}
                            onDelete={(id) => console.log('Delete message', id)}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput 
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSend}
                files={selectedFiles}
                previewUrls={previewUrls}
                onFilesSelected={handleFileSelect}
                onFileRemove={removeSelectedFile}
                onSendVoice={sendVoiceMessage}
                isActive={conversation.is_active}
            />
        </div>
    );
};

export default ChatWindow;
