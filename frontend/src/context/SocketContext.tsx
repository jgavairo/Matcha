import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socketService: typeof socketService;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            socketService.connect();
        } else {
            socketService.disconnect();
        }

        return () => {
            socketService.disconnect();
        };
    }, [isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socketService }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
