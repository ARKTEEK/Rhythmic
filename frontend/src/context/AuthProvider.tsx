import { UserDto } from "../models/User";
import { AuthContext, AuthContextType } from "./AuthContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ReactNode, useEffect, useState } from "react";
import { JwtPayload } from "../models/JwtPayload.ts";

interface JwtPayload {
  email: string;
  given_name: string;
  exp?: number;
  role?: string | string[];
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = (token: string) => {
    try {
      const rawUser = jwtDecode<JwtPayload>(token);

      const currentTime = Date.now() / 1000;
      if (rawUser.exp && rawUser.exp < currentTime) {
        logout();
        return;
      }

      // Extract roles from JWT
      const roles = Array.isArray(rawUser.role) ? rawUser.role : rawUser.role ? [rawUser.role] : [];

      const normalizedUser: UserDto = {
        email: rawUser.email,
        username: rawUser.given_name,
        exp: rawUser.exp,
        roles: roles,
      };

      setUser(normalizedUser);
      setIsAuthenticated(true);
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${ token }`;
    } catch (error) {
      console.error("Error decoding JWT on login:", error);
      logout();
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const rawUser = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000;

        if (rawUser.exp && rawUser.exp > currentTime) {
          // Extract roles from JWT
          const roles = Array.isArray(rawUser.role) ? rawUser.role : rawUser.role ? [rawUser.role] : [];

          const normalizedUser: UserDto = {
            email: rawUser.email,
            username: rawUser.given_name,
            exp: rawUser.exp,
            roles: roles,
          };

          setUser(normalizedUser);
          setIsAuthenticated(true);

          axios.defaults.headers.common["Authorization"] = `Bearer ${ token }`;
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const contextValue: AuthContextType = { user, isAuthenticated, isLoading, login, logout };

  return (
    <AuthContext.Provider value={ contextValue }>
      { children }
    </AuthContext.Provider>
  );
};
