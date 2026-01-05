import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    public socket: Socket | null = null;

    connect() {
        const token = Cookies.get('token');
        
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: {
                token
            },
            transports: ['websocket'],
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event: string, data: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event: string, callback?: (data: any) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }
}

export const socketService = new SocketService();
