import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../services/chatService';
import { HiDownload, HiPlay, HiPause } from 'react-icons/hi';

interface ChatBubbleProps {
    message: Message;
    isMe: boolean;
    otherUsername: string;
    otherUserImage?: string | null;
    currentUserImage?: string | null;
    otherUserId?: number;
    currentUserId?: number;
}

interface ParsedContent {
    type: 'text' | 'image' | 'audio';
    text?: string;
    urls?: string[];
    url?: string; // for audio
    duration?: number;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
    message, 
    isMe, 
    otherUsername,
    otherUserImage,
    currentUserImage,
    otherUserId,
    currentUserId
}) => {
    const [parsedContent, setParsedContent] = useState<ParsedContent>({ type: 'text', text: message.content });
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        try {
            const parsed = JSON.parse(message.content);
            if (parsed && (parsed.type === 'image' || parsed.type === 'audio')) {
                setParsedContent(parsed);
            } else {
                setParsedContent({ type: 'text', text: message.content });
            }
        } catch (e) {
            setParsedContent({ type: 'text', text: message.content });
        }
    }, [message.content]);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (time: number) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const handleDownload = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = url.split('/').pop() || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(url, '_blank');
        }
    };

    // Use profile photos if available, otherwise fallback to generated avatar
    const avatarUrl = isMe 
        ? (currentUserImage || `https://ui-avatars.com/api/?name=Me&background=random`)
        : (otherUserImage || `https://ui-avatars.com/api/?name=${otherUsername}&background=random`);
    const timeString = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (message.type === 'system') {
        return (
            <div className="flex justify-center my-4">
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    // Render Logic
    const renderContent = () => {
        switch (parsedContent.type) {
            case 'audio':
                // Generate simple visualization bars
                // Using a predefined pattern of heights to mimic a waveform
                const barHeights = [6, 9, 27, 27, 34, 34, 29, 20, 13, 8, 15, 34, 34, 39, 39, 36, 27, 22, 17, 36, 36, 26, 22, 22, 13, 8, 5];
                
                return (
                    <div className="flex items-center space-x-2">
                       <button 
                            onClick={toggleAudio} 
                            className="inline-flex self-center items-center p-2 rounded-full text-gray-900 bg-white/20 hover:bg-white/30 dark:text-white dark:bg-gray-600/50 dark:hover:bg-gray-600 transition-colors focus:outline-none" 
                            type="button"
                        >
                          {isPlaying ? (
                              <HiPause className="w-5 h-5" />
                          ) : (
                              <HiPlay className="w-5 h-5 pl-0.5" />
                          )}
                       </button>
                       
                       <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 h-10 px-2 min-w-[150px]">
                                {barHeights.map((height, i) => {
                                    const progress = currentTime / (duration || 1);
                                    const barProgress = i / barHeights.length;
                                    const isPlayed = barProgress < progress;
                                    
                                    return (
                                        <div 
                                            key={i} 
                                            className={`w-1 rounded-full transition-colors duration-200 ${
                                                isPlayed 
                                                    ? (isMe ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-800 dark:bg-gray-200')
                                                    : (isMe ? 'bg-blue-300 dark:bg-blue-800' : 'bg-gray-400 dark:bg-gray-500')
                                            }`}
                                            style={{ height: `${height}px` }}
                                        />
                                    );
                                })}
                            </div>
                            <span className={`text-xs font-medium px-1 ${isMe ? 'text-blue-700 dark:text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                {isPlaying ? formatTime(currentTime) : (duration ? formatTime(duration) : "Loading...")}
                            </span>
                       </div>

                       <audio 
                           ref={audioRef} 
                           src={parsedContent.url} 
                           onLoadedMetadata={handleLoadedMetadata}
                           onTimeUpdate={handleTimeUpdate}
                           onEnded={handleAudioEnded}
                           className="hidden" 
                       />
                    </div>
                );

            case 'image':
                const urls = parsedContent.urls || [];
                if (urls.length === 0) return null;

                const displayImages = urls.slice(0, 4);
                const remainingCount = urls.length - 4;

                return (
                    <div className="flex flex-col gap-2">
                        {parsedContent.text && (
                            <p className="text-sm font-normal text-gray-900 dark:text-white whitespace-pre-wrap break-all mb-2">
                                {parsedContent.text}
                            </p>
                        )}
                        <div className={`grid gap-2 grid-cols-2`}>
                            {displayImages.map((url, index) => {
                                const isLastItem = index === 3 && remainingCount > 0;
                                
                                return (
                                    <div key={index} className="group/image relative aspect-square">
                                        {/* Hover Overlay with Download Button (Only shows if NOT the +N item) */}
                                        {!isLastItem && (
                                            <div className="absolute inset-0 w-full h-full bg-gray-900/50 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center z-10">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDownload(url); }} 
                                                    className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                                                    title="Download"
                                                >
                                                    <HiDownload className="w-5 h-5 text-white" />
                                                </button>
                                            </div>
                                        )}

                                        {/* +N Overlay (Always visible for the last item if more exist) */}
                                        {isLastItem && (
                                            <button className="absolute inset-0 w-full h-full bg-gray-900/60 hover:bg-gray-900/40 transition-all duration-300 rounded-lg flex items-center justify-center z-20">
                                                <span className="text-xl font-medium text-white">+{remainingCount + 1}</span>
                                            </button>
                                        )}
                                        
                                        <img src={url} className="rounded-lg w-full h-full object-cover" alt={`Attachment ${index}`} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            default: // Text
                return (
                    <p className="text-sm font-normal text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                        {message.content}
                    </p>
                );
        }
    };

    return (
        <div className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''} group mb-4`}>
            <img 
                className="w-8 h-8 rounded-full object-cover" 
                src={avatarUrl} 
                alt="User avatar"
            />
            
            <div className="flex flex-col gap-1 w-full max-w-[320px]">
                <div className={`flex items-center space-x-2 rtl:space-x-reverse ${isMe ? 'justify-end' : ''}`}>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isMe ? 'You' : otherUsername}
                    </span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {timeString}
                    </span>
                </div>
                
                <div className={`flex flex-col leading-1.5 p-4 border-gray-200 ${isMe ? 'bg-blue-100 dark:bg-blue-700 rounded-s-xl rounded-ee-xl' : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'}`}>
                    {renderContent()}
                </div>
                
                <div className={`flex items-center justify-between ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-sm font-normal text-gray-500 dark:text-gray-400 ${isMe ? 'text-right' : ''}`}>
                        {message.is_read ? 'Read' : 'Delivered'}
                    </span>
                    
                    {parsedContent.type === 'image' && (parsedContent.urls || []).length > 2 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                (parsedContent.urls || []).forEach(url => handleDownload(url));
                            }}
                            className="text-sm text-blue-600 dark:text-blue-500 font-medium inline-flex items-center hover:underline"
                            title="Download all"
                        >
                            <HiDownload className="w-4 h-4 me-1.5" />
                            Save all
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;
