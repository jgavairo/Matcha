import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

// Use relative path for socket.io to leverage Vite proxy
const SOCKET_URL = import.meta.env.PROD 
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : '/'; // Connect to the same origin (Vite dev server) which proxies to backend

class SocketService {
    public socket: Socket;

    constructor() {
        this.socket = io(SOCKET_URL, {
            path: '/socket.io', // Standard socket.io path
            transports: ['websocket', 'polling'], // Enable polling as fallback
            autoConnect: false,
            withCredentials: true
        });

        this.socket.on('connect', () => {
        });

        this.socket.on('disconnect', () => {
        });

        this.socket.on('connect_error', (err) => {
            // Connection error handled by automatic reconnection system
        });
    }

    connect() {
        if (this.socket.connected) return;
        this.socket.connect();
    }

    disconnect() {
        if (this.socket.connected) {
            this.socket.disconnect();
        }
    }

    emit(event: string, data: any) {
        this.socket.emit(event, data);
    }

    on(event: string, callback: (data: any) => void) {
        this.socket.on(event, callback);
    }

    off(event: string, callback?: (data: any) => void) {
        this.socket.off(event, callback);
    }
}

export const socketService = new SocketService();
