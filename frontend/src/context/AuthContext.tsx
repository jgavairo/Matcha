import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import authService from "@features/auth/services/authService";
import { CurrentUser } from "@app-types/user";
import Cookies from "js-cookie";
import { installUnauthorizedInterceptor } from "@services/api"; // <-- nouveau

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: CurrentUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);

  const lock401 = useRef(false);

  const hardLogout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("matcha_search_filters");

    // si ton cookie "token" n'est PAS HttpOnly :
    Cookies.remove("token"); // éventuellement { path: "/" } selon ton set
  }, []);

  // Interceptor global 401
  useEffect(() => {
    const eject = installUnauthorizedInterceptor(() => {
      if (lock401.current) return;
      lock401.current = true;
      hardLogout();
      setTimeout(() => (lock401.current = false), 250);
    });

    return eject;
  }, [hardLogout]);

  // Check auth au chargement
  useEffect(() => {
    const check = async () => {
      try {
        const userData = await authService.checkAuth();
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        hardLogout();
      } finally {
        setIsLoading(false);
      }
    };
    check();
  }, [hardLogout]);

  const login = useCallback(async () => {
    try {
      const userData = await authService.checkAuth();
      setUser(userData);
      setIsAuthenticated(true);
    } catch {
      hardLogout();
    }
  }, [hardLogout]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      hardLogout();
    }
  }, [hardLogout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
