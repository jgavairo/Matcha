import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    public socket: Socket;

    constructor() {
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
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
