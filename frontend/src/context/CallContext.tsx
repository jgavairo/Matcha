import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import CallModal from '../features/chat/components/CallModal';
import { useAuth } from './AuthContext';

interface CallContextType {
    callUser: (userId: number, username: string, avatar: string) => void;
    answerCall: () => void;
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

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    
    // WebRTC Config
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    };

    useEffect(() => {
        socketService.on('call_incoming', (data: any) => {
            console.log("Incoming call from", data.name);
            setIsReceivingCall(true);
            setCaller(data);
            setOtherUser({ name: data.name, avatar: data.avatar });
        });

        socketService.on('call_accepted', async (signal: any) => {
            console.log("Call accepted");
            setCallAccepted(true);
            if (peerConnection.current) {
                try {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
                } catch(e) { 
                    console.error("Error setting remote description", e);
                }
            }
        });

        socketService.on('ice_candidate_incoming', async (candidate: any) => {
            if (peerConnection.current && candidate) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            }
        });

        // Cleanup
        return () => {
            socketService.off('call_incoming');
            socketService.off('call_accepted');
            socketService.off('ice_candidate_incoming');
        };
    }, [socketService]);

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
            console.log("Received remote track");
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
        setIsCallActive(true);
        setCallEnded(false);
        setCallAccepted(false);

        let stream: MediaStream | null = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
        } catch (err) {
            console.error("Error accessing media devices, proceeding without local stream:", err);
            // We proceed even if device is not found, to allow testing signaling or receive-only mode
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
                setRemoteStream(event.streams[0]);
            };

            pc.onconnectionstatechange = () => {
                console.log("Connection state change:", pc.connectionState);
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
                avatar: "https://via.placeholder.com/150" // You might want to pass real avatar from user context
            });

        } catch (err) {
            console.error("Error starting call connection:", err);
            setIsCallActive(false);
        }
    };

    const answerCall = async () => {
        setCallAccepted(true);
        setIsReceivingCall(false); // No longer purely "incoming", it's active
        setIsCallActive(true);

        let stream: MediaStream | null = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
        } catch (err) {
            console.warn("Could not access local media for answering, proceeding anyway:", err);
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
                setRemoteStream(event.streams[0]);
            };

            pc.onconnectionstatechange = () => {
                console.log("Connection state change:", pc.connectionState);
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
            console.error("Error answering call:", err);
        }
    };

    const endCall = () => {
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
        
        // Reload/Reset window to clear any stuck states?
        // window.location.reload(); // Too aggressive
    };

    return (
        <CallContext.Provider value={{
            callUser,
            answerCall,
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-80">
                   <div className="bg-gray-800 p-8 rounded-lg flex flex-col items-center">
                        <h2 className="text-2xl text-white mb-4">{caller?.name} is calling...</h2>
                        <img src={caller?.avatar || "https://via.placeholder.com/150"} className="w-24 h-24 rounded-full mb-6" alt="Caller"/>
                        <div className="flex gap-4">
                            <button onClick={answerCall} className="bg-green-500 text-white px-6 py-3 rounded-full font-bold">Answer</button>
                            <button onClick={() => { setIsReceivingCall(false); setCaller(null); }} className="bg-red-500 text-white px-6 py-3 rounded-full font-bold">Decline</button>
                        </div>
                   </div>
                </div>
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
