import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '../api/auth';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    // Now fetch user info
    const me = await authApi.getMe();
    setUser({ id: me._id || me.id, email: me.email, name: me.name });
    localStorage.setItem('user', JSON.stringify({ id: me._id || me.id, email: me.email, name: me.name }));
  };

  const register = async (email: string, password: string, name: string) => {
    await authApi.signup({ email, password, name });
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };
  // On mount, try to restore session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const me = await authApi.getMe();
        setUser({ id: me._id || me.id, email: me.email, name: me.name });
        localStorage.setItem('user', JSON.stringify({ id: me._id || me.id, email: me.email, name: me.name }));
      } catch {
        setUser(null);
        localStorage.removeItem('user');
      }
    };
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};