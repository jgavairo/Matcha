import React, { useRef, useState } from 'react';
import { HiPhotograph, HiMicrophone, HiPaperAirplane, HiX } from 'react-icons/hi';
import { useNotification } from '@context/NotificationContext';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: (e: React.FormEvent) => void;
    files: File[];
    previewUrls: string[];
    onFilesSelected: (files: File[]) => void;
    onFileRemove: (index: number) => void;
    onSendVoice: (file: File) => Promise<void>;
    isActive: boolean;
    isSending?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
    value, 
    onChange, 
    onSend, 
    files, 
    previewUrls, 
    onFilesSelected, 
    onFileRemove, 
    onSendVoice, 
    isActive,
    isSending = false 
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { addToast } = useNotification();
    
    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            const validImages = selectedFiles.filter(file => file.type.startsWith('image/'));

            if (validImages.length !== selectedFiles.length) {
                addToast('Only image files are allowed', 'error');
            }
            
            if (validImages.length > 0) {
                onFilesSelected(validImages);
            }
        }
        // Reset input so same file selection works if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
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
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], "voice_message.webm", { type: 'audio/webm' });
                await onSendVoice(file);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Auto stop after 60 seconds
            recordingTimeoutRef.current = setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    setIsRecording(false);
                    addToast("Maximum recording duration reached (60s)", 'info');
                }
            }, 60000);

        } catch (err) {
            addToast("Microphone not accessible or permission denied", 'error');
        }
    };

    const stopRecording = () => {
        if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
        }
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

    return (
        <form onSubmit={onSend} className="border-t bg-white dark:bg-gray-800 dark:border-gray-700">
            {!isActive && (
                <div className="p-2 text-center text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                    This conversation is no longer active.
                </div>
            )}
            {isActive && (
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
                                        onClick={() => onFileRemove(i)}
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
                            disabled={isRecording}
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
                            className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-pink-500 dark:focus:border-pink-500 resize-none" 
                            placeholder={isRecording ? "Recording..." : "Your message..."}
                            value={value}
                            disabled={isRecording}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onSend(e);
                                }
                            }}
                        ></textarea>
                        <button 
                            type="submit" 
                            disabled={(!value.trim() && files.length === 0) || isRecording || isSending}
                            className="inline-flex justify-center p-2 text-pink-600 rounded-full cursor-pointer hover:bg-pink-100 dark:text-pink-500 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <HiPaperAirplane className="w-5 h-5 rotate-90 rtl:-rotate-90" />
                            <span className="sr-only">Send message</span>
                        </button>
                    </div>
                </>
            )}
        </form>
    );
};

export default ChatInput;
