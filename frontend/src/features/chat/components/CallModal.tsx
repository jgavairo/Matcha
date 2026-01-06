import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';

interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    otherUsername: string;
    avatarUrl: string;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    connectionState?: string;
}

const CallModal: React.FC<CallModalProps> = ({ 
    isOpen, 
    onClose, 
    otherUsername, 
    avatarUrl, 
    localStream, 
    remoteStream,
    connectionState
}) => {
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    
    // Refs for video elements
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Attach streams to video elements
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);


    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !isMicOn;
                setIsMicOn(!isMicOn);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !isVideoOn;
                setIsVideoOn(!isVideoOn);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-95">
            <div className="relative w-full h-full md:w-3/4 md:h-5/6 flex flex-col items-center justify-center bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
                
                {/* Main Remote Video Area */}
                <div className="relative w-full h-full flex items-center justify-center bg-gray-800">
                    {remoteStream ? (
                        <video 
                            ref={remoteVideoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center animate-pulse">
                            <img src={avatarUrl || "https://via.placeholder.com/150"} alt={otherUsername} className="w-32 h-32 rounded-full mb-4 border-4 border-gray-600" />
                            <h3 className="text-2xl text-white font-semibold">
                                {connectionState === 'connected' ? 'Connected (No Video)' : `Connecting to ${otherUsername}...`}
                            </h3>
                        </div>
                    )}

                    {/* Local Video (PiP) */}
                    {localStream && (
                        <div className="absolute top-4 right-4 w-32 h-48 bg-black rounded-lg border-2 border-gray-700 overflow-hidden shadow-lg transform hover:scale-105 transition-transform">
                             <video 
                                ref={localVideoRef} 
                                autoPlay 
                                muted // Always mute local to avoid feedback
                                playsInline 
                                className="w-full h-full object-cover transform scale-x-[-1]" 
                            />
                            {!isVideoOn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white text-xs">
                                    Camera Off
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Floating Controls */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-6 items-center bg-gray-800/90 px-8 py-4 rounded-full backdrop-blur-md shadow-xl border border-gray-700">
                    
                    <button 
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all duration-200 ${isVideoOn ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-500 text-white ring-2 ring-red-400'}`}
                    >
                        {isVideoOn ? <FaVideo className="w-6 h-6" /> : <FaVideoSlash className="w-6 h-6" />}
                    </button>

                    <button 
                        onClick={toggleMic}
                        className={`p-4 rounded-full transition-all duration-200 ${isMicOn ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-500 text-white ring-2 ring-red-400'}`}
                    >
                        {isMicOn ? <FaMicrophone className="w-6 h-6" /> : <FaMicrophoneSlash className="w-6 h-6" />}
                    </button>

                    <button 
                        onClick={onClose}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-110 shadow-lg"
                    >
                        <FaPhoneSlash className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallModal;
