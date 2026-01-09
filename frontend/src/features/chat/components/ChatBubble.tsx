import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../services/chatService';
import { Dropdown, DropdownItem } from 'flowbite-react';
import { HiDotsVertical, HiDownload, HiPlay, HiPause } from 'react-icons/hi';

interface ChatBubbleProps {
    message: Message;
    isMe: boolean;
    otherUsername: string;
    otherUserImage?: string | null;
    currentUserImage?: string | null;
    onReply?: (message: Message) => void;
    onCopy?: (content: string) => void;
    onDelete?: (messageId: number) => void;
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
    onReply,
    onCopy,
    onDelete
}) => {
    const [parsedContent, setParsedContent] = useState<ParsedContent>({ type: 'text', text: message.content });
    const [isPlaying, setIsPlaying] = useState(false);
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

    const handleCopy = () => {
        if (onCopy) {
            onCopy(parsedContent.text || '');
        } else {
            navigator.clipboard.writeText(parsedContent.text || '');
        }
    };

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
            console.error('Download failed', error);
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
                return (
                    <div className={`flex items-center space-x-1.5 rtl:space-x-reverse`}>
                       <button onClick={toggleAudio} className="inline-flex self-center items-center text-gray-900 dark:text-white hover:text-gray-600" type="button">
                          {isPlaying ? (
                              <HiPause className="w-6 h-6" />
                          ) : (
                              <HiPlay className="w-6 h-6" />
                          )}
                       </button>
                       <audio 
                           ref={audioRef} 
                           src={parsedContent.url} 
                           onEnded={() => setIsPlaying(false)}
                           className="hidden" 
                       />
                       {/* Simplified Waveform Visual */}
                       <div className="flex items-center gap-0.5 h-8">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className={`w-1 bg-gray-500 dark:bg-gray-400 rounded-full ${i % 2 === 0 ? 'h-3' : 'h-5'}`}></div>
                            ))}
                       </div>
                       <span className="inline-flex self-center items-center text-sm font-medium text-gray-900 dark:text-white">
                           {/* Add duration if available, else just placeholder */}
                           Voice
                       </span>
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
            <img className="w-8 h-8 rounded-full object-cover" src={avatarUrl} alt="User avatar" />
            
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

            {/* Dropdown Menu */}
            <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Dropdown 
                    label="" 
                    renderTrigger={() => (
                        <button className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600 border border-gray-200 dark:border-gray-700" type="button">
                            <HiDotsVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    )}
                    placement={isMe ? "bottom-end" : "bottom-start"}
                >
                    <DropdownItem onClick={() => onReply?.(message)}>Reply</DropdownItem>
                    {parsedContent.type === 'text' && <DropdownItem onClick={handleCopy}>Copy</DropdownItem>}
                    <DropdownItem onClick={() => onDelete?.(message.id)} className="text-red-600 dark:text-red-500">Delete</DropdownItem>
                </Dropdown>
            </div>
        </div>
    );
};

export default ChatBubble;
