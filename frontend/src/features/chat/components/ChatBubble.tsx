import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../services/chatService';
import { Dropdown, DropdownItem } from 'flowbite-react';
import { HiDotsVertical } from 'react-icons/hi';

interface ChatBubbleProps {
    message: Message;
    isMe: boolean;
    otherUsername: string;
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

    const handleDownload = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const avatarUrl = `https://ui-avatars.com/api/?name=${isMe ? 'Me' : otherUsername}&background=random`;
    const timeString = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (message.sender_id === null) {
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
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                              </svg>
                          ) : (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
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
                if (urls.length === 1) {
                    return (
                        <div className="group relative my-2.5">
                            <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                <button onClick={() => handleDownload(urls[0])} className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50">
                                  <svg className="w-5 h-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"/></svg>
                                </button>
                            </div>
                            <img src={urls[0]} className="rounded-lg max-w-full h-auto object-cover max-h-64" alt="Attachment" />
                        </div>
                    );
                } else if (urls.length > 1) {
                    return (
                        <div className="grid gap-2 grid-cols-2 my-2.5">
                            {urls.map((url, index) => (
                                <div key={index} className={`group relative ${index === 2 && urls.length > 4 ? 'col-span-2' : ''}`}>
                                    <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                        <button onClick={() => handleDownload(url)} className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50">
                                            <svg className="w-5 h-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"/></svg>
                                        </button>
                                    </div>
                                    <img src={url} className="rounded-lg w-full h-24 object-cover" alt={`Attachment ${index}`} />
                                    {index === 3 && urls.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-xl">+{urls.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                }
                return null;

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
            <img className="w-8 h-8 rounded-full" src={avatarUrl} alt="User avatar" />
            
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
                
                <span className={`text-sm font-normal text-gray-500 dark:text-gray-400 ${isMe ? 'text-right' : ''}`}>
                    {message.is_read ? 'Read' : 'Delivered'}
                </span>
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
