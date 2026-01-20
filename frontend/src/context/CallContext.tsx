import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import CallModal from '../features/chat/components/CallModal';
import { IncomingCallToast } from '../features/chat/components/IncomingCallToast';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface CallContextType {
    callUser: (userId: number, username: string, avatar: string) => void;
    answerCall: () => void;
    declineCall: () => void;
    endCall: () => void;
    callAccepted: boolean;
    callEnded: boolean;
    isReceivingCall: boolean;
    isCallActive: boolean;
    callerName: string;
    callerAvatar: string;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    connectionState: string;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { socketService } = useSocket();
    const { addToast } = useNotification();
    const { user } = useAuth();
    
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isReceivingCall, setIsReceivingCall] = useState(false);
    const [caller, setCaller] = useState<{from: number, name: string, avatar: string, signal: any} | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [connectionState, setConnectionState] = useState<string>('new');
    
    // For outgoing calls
    const [otherUser, setOtherUser] = useState<{name: string, avatar: string} | null>(null);

    const [activeCallUserId, setActiveCallUserId] = useState<number | null>(null);

    const peerConnection = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                const audioInputs = devices.filter(d => d.kind === 'audioinput');
                const videoInputs = devices.filter(d => d.kind === 'videoinput');
                if (audioInputs.length === 0 && videoInputs.length === 0) {
                    // Silent check
                }
            }).catch(e => {});
        }
    }, []);
    
    // WebRTC Config
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    };

    useEffect(() => {
        socketService.on('call_incoming', (data: any) => {
            setIsReceivingCall(true);
            setCaller(data);
            setActiveCallUserId(data.from);
            setOtherUser({ name: data.name, avatar: data.avatar });
        });

        socketService.on('call_accepted', async (signal: any) => {
            setCallAccepted(true);
            if (peerConnection.current) {
                try {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
                } catch(e) { 
                    // Error already handled by UI
                }
            }
        });

        socketService.on('call_declined', () => {
            addToast("Call declined", 'info');
            setIsCallActive(false);
            setCallEnded(true);
            setOtherUser(null);
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
            }
        });

        socketService.on('call_busy', () => {
            addToast("User is busy", 'warning');
            setIsCallActive(false);
            setCallEnded(true);
            setOtherUser(null);
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
            }
        });

        socketService.on('call_ended', () => {
             addToast("Call ended", 'info');
             endCallLocalCleanup();
        });

        socketService.on('ice_candidate_incoming', async (candidate: any) => {
            if (peerConnection.current && candidate) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    // Error already handled by UI
                }
            }
        });

        // Cleanup
        return () => {
            socketService.off('call_incoming');
            socketService.off('call_accepted');
            socketService.off('call_declined');
            socketService.off('call_busy');
            socketService.off('call_ended');
            socketService.off('ice_candidate_incoming');
        };
    }, [socketService, localStream]); // Add localStream to dep if needed for cleanup, or use ref

    const setupPeerConnection = (isInitiator: boolean, remoteUserId: number) => {
        const pc = new RTCPeerConnection(rtcConfig);
        
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketService.emit('ice_candidate', { 
                    to: remoteUserId, 
                    candidate: event.candidate 
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        peerConnection.current = pc;
        return pc;
    };

    const callUser = async (userId: number, username: string, avatar: string) => {
        setOtherUser({ name: username, avatar });
        setActiveCallUserId(userId);
        setIsCallActive(true);
        setCallEnded(false);
        setCallAccepted(false);

        let stream: MediaStream | null = null;
        
        // Check for secure context/media device support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            addToast("Video calls require HTTPS or localhost.", 'error');
            console.error("navigator.mediaDevices.getUserMedia is not available. Context:", window.isSecureContext ? "Secure" : "Insecure");
        } else {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
            } catch (err: any) {
                // Fallback 1: Try Audio Only (Camera broken/denied)
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    setLocalStream(stream);
                    addToast("Camera not found/allowed, starting with audio only", 'info');
                } catch (audioErr: any) {
                    // Fallback 2: Try Video Only (Mic broken/denied - User case)
                    try {
                         stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                         setLocalStream(stream);
                         addToast("Microphone not found, starting with video only", 'info');
                    } catch (videoErr: any) {
                         let errorMessage = "Could not access camera or microphone";
                         if (videoErr.name === 'NotAllowedError') errorMessage = "Permission denied for media devices.";
                         addToast(errorMessage, 'error');
                    }
                }
            }
        }

        try {
            // Let's create PC now.
            const pc = new RTCPeerConnection(rtcConfig);
            
            if (stream) {
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            }

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socketService.emit('ice_candidate', { 
                        to: userId, 
                        candidate: event.candidate 
                    });
                }
            };
    
            pc.ontrack = (event) => {
                setRemoteStream(new MediaStream(event.streams[0]));
            };

            pc.onconnectionstatechange = () => {
                setConnectionState(pc.connectionState);
            };

            peerConnection.current = pc;

            // offerToReceive needed if we have no tracks ourselves, to tell other side we want video/audio
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            await pc.setLocalDescription(offer);

            socketService.emit('call_user', {
                userToCall: userId,
                signalData: offer,
                from: user?.id,
                name: user?.username || "Unknown",
                avatar: user?.images?.[0] || ""
            });

        } catch (err) {
            setIsCallActive(false);
        }
    };

    const answerCall = async () => {
        setCallAccepted(true);
        setIsReceivingCall(false); // No longer purely "incoming", it's active
        setIsCallActive(true);

        let stream: MediaStream | null = null;
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            addToast("Video calls require HTTPS or localhost.", 'error');
             console.error("navigator.mediaDevices.getUserMedia is not available. Context:", window.isSecureContext ? "Secure" : "Insecure");
        } else {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
            } catch (err: any) {
                // Fallback 1: Try Audio Only (Camera failed)
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    setLocalStream(stream);
                    addToast("Camera not found/allowed, answering with audio only", 'info');
                } catch (audioErr: any) {
                    // Fallback 2: Try Video Only (Mic failed)
                    try {
                         stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                         setLocalStream(stream);
                         addToast("Microphone not found, answering with video only", 'info');
                    } catch (videoErr: any) {
                        let errorMessage = "Could not access camera or microphone";
                        addToast(errorMessage, 'error');
                    }
                }
            }
        }

        try {
            const pc = new RTCPeerConnection(rtcConfig);
            if (stream) {
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            }

            pc.onicecandidate = (event) => {
                if (event.candidate && caller) {
                    socketService.emit('ice_candidate', { 
                        to: caller.from, 
                        candidate: event.candidate 
                    });
                }
            };
    
            pc.ontrack = (event) => {
                setRemoteStream(new MediaStream(event.streams[0]));
            };

            pc.onconnectionstatechange = () => {
                setConnectionState(pc.connectionState);
            };

            peerConnection.current = pc;

            if (caller && caller.signal) {
                await pc.setRemoteDescription(new RTCSessionDescription(caller.signal));
                const answer = await pc.createAnswer(); // Will answer with recvonly if no local tracks
                await pc.setLocalDescription(answer);

                socketService.emit('answer_call', { 
                    signal: answer, 
                    to: caller.from 
                });
            }

        } catch (err) {
            // Error already handled by UI
        }
    };

    const endCallLocalCleanup = () => {
        setCallEnded(true);
        setIsCallActive(false);
        setIsReceivingCall(false);
        setCallAccepted(false);
        setConnectionState('new');
        
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        
        setRemoteStream(null);
        setOtherUser(null);
        setCaller(null);
        setActiveCallUserId(null);
    };

    const declineCall = () => {
        setIsReceivingCall(false);
        setCallAccepted(false);
        
        const targetId = caller?.from || activeCallUserId;
        if (targetId) {
            socketService.emit('call_declined', { to: targetId });
        }
        setCaller(null);
        setOtherUser(null);
        setActiveCallUserId(null);
    };

    const endCall = () => {
        // Emit end call signal to the other user
        const targetId = caller?.from || activeCallUserId;
        if (targetId) {
             socketService.emit('call_ended', { to: targetId });
        }
        
        endCallLocalCleanup();
    };

    return (
        <CallContext.Provider value={{
            callUser,
            answerCall,
            declineCall,
            endCall,
            callAccepted,
            callEnded,
            isReceivingCall,
            isCallActive,
            callerName: otherUser?.name || "Unknown",
            callerAvatar: otherUser?.avatar || "",
            localStream,
            remoteStream,
            connectionState
        }}>
            {children}
            
            {/* Incoming Call Overlay */}
            {isReceivingCall && !callAccepted && (
                <IncomingCallToast 
                    callerName={caller?.name || "Unknown"}
                    callerAvatar={caller?.avatar}
                    onAnswer={answerCall}
                    onDecline={declineCall}
                />
            )}

            {/* Active Call Modal */}
            {isCallActive && (
                <CallModal 
                    isOpen={isCallActive}
                    onClose={endCall}
                    localStream={localStream}
                    remoteStream={remoteStream}
                    otherUsername={otherUser?.name || "User"}
                    avatarUrl={otherUser?.avatar || ""}
                    connectionState={connectionState}
                />
            )}

        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};
