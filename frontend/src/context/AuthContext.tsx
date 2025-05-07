import { jwtDecode } from "jwt-decode";
import { UserDto } from "../entities/User.ts";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import axios from "axios";

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);

  const login = (token: string) => {
    const decodedUser = jwtDecode<UserDto>(token);
    setUser(decodedUser);
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${ token }`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode<UserDto>(token);
        setUser(decodedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${ token }`;
      } catch (e) {
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={ { user, isAuthenticated: !!user, login, logout } }>
      { children }
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
