import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Mic, MicOff, Camera, CameraOff, Monitor, PhoneOff, MessageSquare, Clock, PenTool, X, FileText } from 'lucide-react';
import ChatSidebar from '../components/ChatSidebar';
import Whiteboard from '../components/Whiteboard';

const SessionPage = () => {
    const { roomId } = useParams();
    const { user } = useAuth();

    // Stream State
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);

    // Refs for WebRTC
    const streamRef = useRef<MediaStream | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);

    // Refs for Video Elements
    const mainVideoRef = useRef<HTMLVideoElement>(null);
    const pipVideoRef = useRef<HTMLVideoElement>(null);

    const [partnerId, setPartnerId] = useState<string | null>(null);
    const navigate = useNavigate();

    // Controls State
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

    // Timer State
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Notes State
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // Auto-save Notes
    useEffect(() => {
        const saveNotes = async () => {
            if (!roomId) return;
            setIsSavingNotes(true);
            try {
                await api.patch(`/sessions/${roomId}`, { notes });
            } catch (err) {
                console.error("Failed to save notes", err);
            } finally {
                setIsSavingNotes(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (notes) {
                saveNotes();
            }
        }, 2000); // Auto-save after 2 seconds of inactivity

        return () => clearTimeout(timeoutId);
    }, [notes, roomId]);

    // Fetch Session
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get(`/sessions/${roomId}`);
                const session = res.data;
                if (user?._id === session.mentorId._id) {
                    setPartnerId(session.menteeId._id);
                } else {
                    setPartnerId(session.mentorId._id);
                }
                if (session.notes) {
                    setNotes(session.notes);
                }
            } catch (err) {
                console.error("Failed to fetch session", err);
            }
        };

        if (roomId && user) {
            fetchSession();
        }
    }, [roomId, user]);

    // Initialize WebRTC & Socket
    useEffect(() => {
        if (!partnerId) return;

        // Use VITE_API_URL or default to localhost:4000 (backend port)
        const socketUrl = import.meta.env.VITE_API_URL || 'https://skill-bridge-backend-current.onrender.com/api';
        console.log("Connecting to socket at:", socketUrl);
        socketRef.current = io(socketUrl.replace('/api', '')); // Remove /api if present for socket root

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setLocalStream(currentStream);
                streamRef.current = currentStream;

                socketRef.current?.emit('join-room', roomId, user?._id);

                socketRef.current?.on('user-connected', () => {
                    console.log("User connected, calling...");
                    callUser();
                });

                socketRef.current?.on('offer', handleReceiveOffer);
                socketRef.current?.on('answer', handleReceiveAnswer);
                socketRef.current?.on('ice-candidate', handleNewICECandidateMsg);
            })
            .catch((err) => {
                console.error("Error accessing media devices:", err);
                if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    alert("Camera/Microphone is already in use by another application (or tab). Please close other apps/tabs using the camera.");
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    alert("Permission to access camera/microphone was denied. Please allow access in your browser settings.");
                } else {
                    alert(`Could not access camera/microphone: ${err.message}`);
                }
            });

        return () => {
            socketRef.current?.disconnect();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerRef.current) {
                peerRef.current.close();
            }
        };
    }, [roomId, user, partnerId]);

    // Update Video Elements when streams change
    useEffect(() => {
        // Main Video Logic:
        // If Screen Sharing -> Show Local Screen
        // Else -> Show Remote Stream
        if (mainVideoRef.current) {
            if (isScreenSharing && localScreenStream) {
                mainVideoRef.current.srcObject = localScreenStream;
            } else if (remoteStream) {
                mainVideoRef.current.srcObject = remoteStream;
            } else {
                mainVideoRef.current.srcObject = null;
            }
            // Ensure play is called
            if (mainVideoRef.current.srcObject) {
                mainVideoRef.current.play().catch(e => console.error("Error playing main video:", e));
            }
        }

        // PIP Video Logic:
        // Always show Local Camera (unless we want to swap when screen sharing, but let's keep it simple)
        if (pipVideoRef.current) {
            pipVideoRef.current.srcObject = localStream;
            if (pipVideoRef.current.srcObject) {
                pipVideoRef.current.play().catch(e => console.error("Error playing pip video:", e));
            }
        }
    }, [localStream, remoteStream, localScreenStream, isScreenSharing]);


    // Timer Logic
    // Timer Logic - Synced with Server
    useEffect(() => {
        let interval: any;

        const checkTimer = async () => {
            if (!roomId || !user) return;

            try {
                // If connected and not started, try to start (idempotent)
                if (connectionStatus === 'connected') {
                    await api.post(`/sessions/${roomId}/start`);
                }

                // Fetch latest session state to get activeStartedAt
                const res = await api.get(`/sessions/${roomId}`);
                const session = res.data;

                if (session.activeStartedAt) {
                    const startTime = new Date(session.activeStartedAt).getTime();
                    const endTime = startTime + 20 * 60 * 1000; // 20 minutes
                    const now = Date.now();
                    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

                    setTimeLeft(remaining);

                    if (remaining <= 0) {
                        clearInterval(interval);
                        alert("Session time is up!");
                        endCall();
                    }
                } else {
                    // Not started yet
                    setTimeLeft(null);
                }
            } catch (err) {
                console.error("Error syncing timer:", err);
            }
        };

        // Check immediately and then every 5 seconds
        if (connectionStatus === 'connected') {
            checkTimer();
            interval = setInterval(checkTimer, 5000);
        }

        return () => clearInterval(interval);
    }, [roomId, user, connectionStatus]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const createPeer = () => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.onconnectionstatechange = () => {
            console.log("Connection state:", peer.connectionState);
            if (peer.connectionState === 'connected') setConnectionStatus('connected');
            if (peer.connectionState === 'disconnected') setConnectionStatus('disconnected');
            if (peer.connectionState === 'failed') setConnectionStatus('disconnected');
        };

        streamRef.current?.getTracks().forEach(track => {
            peer.addTrack(track, streamRef.current!);
        });

        return peer;
    };

    const callUser = async () => {
        console.log("Creating offer...");
        peerRef.current = createPeer();
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        socketRef.current?.emit('offer', { target: partnerId, caller: user?._id, sdp: offer });
    };

    const handleReceiveOffer = async (payload: any) => {
        console.log("Received offer, creating answer...");
        peerRef.current = createPeer();
        await peerRef.current.setRemoteDescription(payload.sdp);
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socketRef.current?.emit('answer', { target: payload.caller, caller: user?._id, sdp: answer });
    };

    const handleReceiveAnswer = (payload: any) => {
        peerRef.current?.setRemoteDescription(payload.sdp);
    };

    const handleICECandidateEvent = (e: RTCPeerConnectionIceEvent) => {
        if (e.candidate && partnerId) {
            console.log("Generated ICE candidate");
            socketRef.current?.emit('ice-candidate', { target: partnerId, candidate: e.candidate });
        }
    };

    const handleNewICECandidateMsg = (candidate: RTCIceCandidate) => {
        console.log("Received ICE candidate");
        peerRef.current?.addIceCandidate(candidate).catch(e => console.error("Error adding ICE candidate:", e));
    };

    const handleTrackEvent = (e: RTCTrackEvent) => {
        console.log("Received remote track:", e.streams[0]);
        setRemoteStream(e.streams[0]);
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const shareScreen = async () => {
        if (isScreenSharing) {
            // Stop sharing
            if (localScreenStream) {
                localScreenStream.getTracks().forEach(track => track.stop());
            }
            setLocalScreenStream(null);

            // Revert track sender to camera
            if (localStream && peerRef.current) {
                const videoTrack = localStream.getVideoTracks()[0];
                const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
            }

            setIsScreenSharing(false);
        } else {
            // Start sharing
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setLocalScreenStream(screenStream);

                const screenTrack = screenStream.getVideoTracks()[0];
                screenTrack.onended = () => {
                    shareScreen(); // Revert when user stops sharing via browser UI
                };

                if (peerRef.current) {
                    const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                }

                setIsScreenSharing(true);
            } catch (err) {
                console.error("Error sharing screen:", err);
            }
        }
    };

    const endCall = async () => {
        try {
            await api.patch(`/sessions/${roomId}`, { status: 'completed' });
        } catch (err) {
            console.error("Failed to mark session as completed", err);
        }
        socketRef.current?.disconnect();
        localStream?.getTracks().forEach(track => track.stop());
        localScreenStream?.getTracks().forEach(track => track.stop());
        navigate('/dashboard');
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-neutral-charcoal overflow-hidden relative">
            {/* Main Content */}
            <div className={`flex-1 flex flex-col relative transition-all duration-300 ${showChat ? 'md:mr-0' : ''}`}>

                {/* Header / Timer */}
                <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white flex items-center gap-4 border border-white/10">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-400" />
                        <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        <span className="text-xs font-medium uppercase tracking-wider opacity-80 hidden sm:inline">{connectionStatus}</span>
                    </div>
                </div>

                {/* Video Area */}
                <div className="flex-1 p-2 md:p-4 flex items-center justify-center relative">
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        {/* Main Video (Remote or Local Screen) */}
                        <video
                            playsInline
                            autoPlay
                            ref={mainVideoRef}
                            className="w-full h-full object-cover"
                        />

                        {/* Placeholder if no video */}
                        {!mainVideoRef.current?.srcObject && (
                            <div className="absolute inset-0 flex items-center justify-center text-white/30">
                                <p>Waiting for video...</p>
                            </div>
                        )}

                        {/* PIP Video (Local Camera) */}
                        <div className="absolute bottom-4 right-4 w-24 md:w-64 aspect-video bg-gray-800 rounded-lg md:rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all hover:scale-105">
                            <video
                                playsInline
                                autoPlay
                                muted
                                ref={pipVideoRef}
                                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                            />
                            {isVideoOff && (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                                    <CameraOff className="w-4 h-4 md:w-8 md:h-8 opacity-50" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Whiteboard Overlay */}
                {showWhiteboard && (
                    <div className="absolute inset-4 md:inset-8 z-20 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-100 p-2 flex justify-between items-center border-b">
                            <h3 className="font-bold text-gray-700 px-2">Shared Whiteboard</h3>
                            <button
                                onClick={() => setShowWhiteboard(false)}
                                className="p-1 hover:bg-gray-200 rounded-full"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 relative">
                            <Whiteboard socket={socketRef.current} roomId={roomId || ''} />
                        </div>
                    </div>
                )}

                {/* Controls Bar */}
                <div className="h-16 md:h-20 bg-gray-900/90 backdrop-blur border-t border-white/10 flex items-center justify-center gap-2 md:gap-4 px-4 md:px-8 overflow-x-auto">
                    <button
                        onClick={toggleAudio}
                        className={`p-3 md:p-4 rounded-full transition-all ${isAudioMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                        {isAudioMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-3 md:p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                        {isVideoOff ? <CameraOff className="w-5 h-5 md:w-6 md:h-6" /> : <Camera className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>

                    <button
                        onClick={shareScreen}
                        className={`p-3 md:p-4 rounded-full transition-all ${isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                        <Monitor className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <button
                        onClick={() => setShowNotes(!showNotes)}
                        className={`p-3 md:p-4 rounded-full transition-all ${showNotes ? 'bg-yellow-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                        <FileText className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <button
                        onClick={() => setShowWhiteboard(!showWhiteboard)}
                        className={`p-3 md:p-4 rounded-full transition-all ${showWhiteboard ? 'bg-purple-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                        <PenTool className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`p-3 md:p-4 rounded-full transition-all ${showChat ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                        <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <div className="w-px h-8 md:h-10 bg-white/10 mx-1 md:mx-2" />

                    <button
                        onClick={endCall}
                        className="bg-red-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-full hover:bg-red-700 shadow-lg font-semibold flex items-center gap-2 transition-all hover:scale-105 text-sm md:text-base"
                    >
                        <PhoneOff className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden md:inline">End Call</span>
                        <span className="md:hidden">End</span>
                    </button>
                </div>
            </div>

            {/* Chat Sidebar */}
            {showChat && (
                <div className="absolute inset-0 md:static md:w-80 h-full bg-neutral-charcoal z-40 md:z-auto border-l border-white/10 flex flex-col">
                    <div className="md:hidden p-4 bg-gray-900 flex justify-between items-center border-b border-white/10">
                        <h3 className="text-white font-bold">Chat</h3>
                        <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">
                            Close
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <ChatSidebar
                            socket={socketRef.current}
                            roomId={roomId || ''}
                            userId={user?._id || ''}
                            userName={user?.name || 'User'}
                        />
                    </div>
                </div>
            )}

            {/* Notes Panel */}
            {showNotes && (
                <div className="absolute top-20 right-4 w-80 bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col border border-gray-200 animate-in slide-in-from-right-10 duration-200">
                    <div className="bg-yellow-50 p-3 flex justify-between items-center border-b border-yellow-100">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-yellow-600" />
                            <h3 className="font-bold text-gray-700">Session Notes</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {isSavingNotes && <span className="text-xs text-gray-400 animate-pulse">Saving...</span>}
                            <button onClick={() => setShowNotes(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Type your notes here... (Auto-saved)"
                        className="w-full h-64 p-4 resize-none focus:outline-none text-gray-700 text-sm"
                    />
                </div>
            )}

            {/* Whiteboard Overlay - Moved to Root for Z-Index Priority */}
            {showWhiteboard && (
                <div className="absolute inset-4 md:inset-8 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                    <div className="bg-gray-100 p-2 flex justify-between items-center border-b">
                        <h3 className="font-bold text-gray-700 px-2">Shared Whiteboard</h3>
                        <button
                            onClick={() => setShowWhiteboard(false)}
                            className="p-1 hover:bg-gray-200 rounded-full"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <Whiteboard socket={socketRef.current} roomId={roomId || ''} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionPage;
