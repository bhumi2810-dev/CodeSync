import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import type { User } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  loginWithGithub: (data?: { code?: string; name?: string; email?: string }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("codesync_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("codesync_token");
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("codesync_token");
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem("codesync_user", JSON.stringify(res.data));
          }
        } catch (e) {
          console.warn("Session expired or invalid, logging out");
          localStorage.removeItem("codesync_token");
          localStorage.removeItem("codesync_user");
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const loggedUser = res.data.user;
      const userToken = res.data.token;
      setUser(loggedUser);
      setToken(userToken);
      localStorage.setItem("codesync_token", userToken);
      localStorage.setItem("codesync_user", JSON.stringify(loggedUser));
      return loggedUser;
    }
    throw new Error(res.message || "Login failed");
  };

  const signup = async (name: string, email: string, password: string): Promise<User> => {
    const res = await authService.signup({ name, email, password });
    if (res.success && res.data) {
      const createdUser = res.data.user;
      const userToken = res.data.token;
      setUser(createdUser);
      setToken(userToken);
      localStorage.setItem("codesync_token", userToken);
      localStorage.setItem("codesync_user", JSON.stringify(createdUser));
      return createdUser;
    }
    throw new Error(res.message || "Signup failed");
  };

  const loginWithGithub = async (data?: { code?: string; name?: string; email?: string }): Promise<User> => {
    const res = await authService.loginWithGithub(data);
    if (res.success && res.data) {
      const loggedUser = res.data.user;
      const userToken = res.data.token;
      setUser(loggedUser);
      setToken(userToken);
      localStorage.setItem("codesync_token", userToken);
      localStorage.setItem("codesync_user", JSON.stringify(loggedUser));
      return loggedUser;
    }
    throw new Error(res.message || "GitHub login failed");
  };

  const logout = () => {
    localStorage.removeItem("codesync_token");
    localStorage.removeItem("codesync_user");
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem("codesync_user", JSON.stringify(res.data));
      }
    } catch (e) {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        signup,
        loginWithGithub,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
