import React, { useEffect, useRef, useState } from 'react';
import { HiMicrophone, HiPlay, HiVideoCamera, HiPhone } from 'react-icons/hi';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';


interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    otherUsername: string;
    avatarUrl: string;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, otherUsername, avatarUrl }) => {
    const [isMicOn, setIsMicOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isOpen) {
            startCall();
        } else {
            stopCall();
        }
    }, [isOpen]);

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, isVideoOn]);

    const startCall = async () => {
        try {
            // Request both to verify permissions, but respect toggles?
            // "dans ce modal il y aura un bouton pour activer..." implicitly means they might be off.
            // But usually you start a call with something.
            // Let's Init with Both OFF (or request permission but keep tracks disabled).
            // Actually, for "Facetime" experience, usually you see yourself immediately.
            // Let's try to get stream.
            const newStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            
            // Default: Enable both? Or start Muted/NoVideo?
            // User said "button to activate". Could imply they are inactive initially.
            // But a "Call" usually implies talking. 
            // I'll enable them by default for better UX, user can toggle off.
            setIsMicOn(true);
            setIsVideoOn(true);
            setStream(newStream);
        } catch (err) {
            console.error("Error accessing media devices", err);
            // Maybe user denied video, try audio only?
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setIsMicOn(true);
                setStream(audioStream);
            } catch (e) {
                console.error("Error accessing audio", e);
            }
        }
    };

    const stopCall = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsMicOn(false);
        setIsVideoOn(false);
    };

    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !isMicOn;
                setIsMicOn(!isMicOn);
            }
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !isVideoOn;
                setIsVideoOn(!isVideoOn);
            }
        }
    };

    const handleHangup = () => {
        stopCall();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
            <div className="relative w-full h-full md:w-3/4 md:h-5/6 flex flex-col items-center justify-center">
                
                {/* Video Area */}
                <div className="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                    {stream && isVideoOn ? (
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            muted // Mute local video to prevent feedback
                            playsInline 
                            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                        />
                    ) : (
                        <div className="flex flex-col items-center animate-pulse">
                            <img src={avatarUrl} alt={otherUsername} className="w-32 h-32 rounded-full mb-4 border-4 border-gray-700" />
                            <h3 className="text-2xl text-white font-semibold">Calling {otherUsername}...</h3>
                        </div>
                    )}
                    
                    {/* Floating Controls */}
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-6 items-center bg-gray-800/80 px-8 py-4 rounded-full backdrop-blur-sm">
                        
                        <button 
                            onClick={toggleVideo}
                            className={`p-4 rounded-full transition-colors ${isVideoOn ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-white text-gray-900'}`}
                            title={isVideoOn ? "Turn camera off" : "Turn camera on"}
                        >
                            {isVideoOn ? <FaVideo className="w-6 h-6" /> : <FaVideoSlash className="w-6 h-6" />}
                        </button>

                        <button 
                            onClick={toggleMic}
                            className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-white text-gray-900'}`}
                            title={isMicOn ? "Mute" : "Unmute"}
                        >
                            {isMicOn ? <FaMicrophone className="w-6 h-6" /> : <FaMicrophoneSlash className="w-6 h-6" />}
                        </button>

                        <button 
                            onClick={handleHangup}
                            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                            title="End Call"
                        >
                            <FaPhoneSlash className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallModal;
