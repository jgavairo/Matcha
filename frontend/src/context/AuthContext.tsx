import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@features/auth/services/authService';
import { CurrentUser } from '@app-types/user';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: CurrentUser | null;
    login: () => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<CurrentUser | null>(null);

    // Check authentication on load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authService.checkAuth();
                setUser(userData);
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async () => {
        try {
            const userData = await authService.checkAuth();
            setUser(userData);
            setIsAuthenticated(true);
        } catch {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            localStorage.removeItem('matcha_search_filters');
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
