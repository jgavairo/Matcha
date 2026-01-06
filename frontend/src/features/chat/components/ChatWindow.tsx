import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, chatService } from '../services/chatService';
import { useFileDrop } from '../../../hooks/useFileDrop';
import { useSocket } from '@context/SocketContext';
import { useCall } from '@context/CallContext';
import { useNotification } from '@context/NotificationContext';
import { HiPhone, HiX, HiCloudUpload, HiPhotograph, HiMicrophone, HiPaperAirplane } from 'react-icons/hi';

import ChatBubble from './ChatBubble';
// CallModal removed

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
    
    // Call Context
    const { callUser } = useCall();
    const { addToast } = useNotification();
    
    // Voice Recording
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { socketService } = useSocket();

    const { isDragging, dragHandlers } = useFileDrop({
        onFileSelect: (files) => handleFileSelect(files),
        accept: 'image/'
    });

    useEffect(() => {
        if (conversation) {
            loadMessages();
            chatService.markAsRead(conversation.id);
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

        socketService.on('chat_message', handleMessage);
        socketService.on('messages_read', handleMessagesRead);

        return () => {
            socketService.off('chat_message', handleMessage);
            socketService.off('messages_read', handleMessagesRead);
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

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(Array.from(e.target.files));
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // or audio/mp3 depending on browser support
                const file = new File([blob], "voice_message.webm", { type: 'audio/webm' });
                await sendVoiceMessage(file);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
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
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{otherUsername}</h2>
                <div className="flex items-center gap-4">
                    {conversation.is_active && (
                    <button 
                        onClick={() => {
                            console.log("Calling user from Conversation:", conversation);
                            const otherId = conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id;
                            console.log("Calculated otherId:", otherId);
                            callUser(otherId, otherUsername, "");
                        }}
                        className="p-2 text-green-600 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 dark:text-green-500 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        title="Start Video Call"
                    >
                        <HiPhone className="w-6 h-6" />
                    </button>
                    )}
                    {onClose && (
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden">
                            <HiX className="h-6 w-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-gray-900">
                {messages.map((msg) => {
                    // System Message Render
                    if (msg.type === 'system' || (msg.content && msg.content.startsWith('{') && JSON.parse(msg.content)?.type === 'system')) {
                       // Fallback or explicit check
                       return (
                            <div key={msg.id} className="flex justify-center my-4 w-full">
                                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 text-center italic">
                                    {msg.content}
                                </span>
                            </div>
                       );
                    }

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
            <form onSubmit={handleSend} className="border-t bg-white dark:bg-gray-800 dark:border-gray-700">
                {!conversation.is_active && (
                    <div className="p-2 text-center text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        This conversation is no longer active.
                    </div>
                )}
                {conversation.is_active && (
                    <>
                        {previewUrls.length > 0 && (
                            <div 
                                ref={scrollContainerRef}
                                className="p-4 flex gap-2 overflow-x-auto scrollbar-visible"
                                onWheel={(e) => {
                                    if (scrollContainerRef.current) {
                                        scrollContainerRef.current.scrollLeft += e.deltaY;
                                    }
                                }}
                            >
                                {previewUrls.map((url, i) => (
                                    <div key={i} className="relative inline-block flex-shrink-0">
                                        <img src={url} alt={`Preview ${i}`} className="h-20 w-auto rounded-lg border border-gray-200 dark:border-gray-600" />
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedFile(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                                        >
                                            <HiX className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <label htmlFor="chat" className="sr-only">Your message</label>
                        <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-700">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                multiple
                                onChange={handleFileInputChange} 
                            />
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
                            >
                                <HiPhotograph className="w-5 h-5" />
                                <span className="sr-only">Upload image</span>
                            </button>
                            
                            {/* MIC BUTTON */}
                            <button 
                                type="button" 
                                onClick={toggleRecording}
                                className={`p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <HiMicrophone className="w-5 h-5" />
                                <span className="sr-only">Voice message</span>
                            </button>

                            <textarea 
                                id="chat" 
                                rows={1} 
                                className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none" 
                                placeholder={isRecording ? "Recording..." : "Your message..."}
                                value={newMessage}
                                disabled={isRecording}
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
                                disabled={(!newMessage.trim() && selectedFiles.length === 0) || isRecording}
                                className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <HiPaperAirplane className="w-5 h-5 rotate-90 rtl:-rotate-90" />
                                <span className="sr-only">Send message</span>
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};

export default ChatWindow;
