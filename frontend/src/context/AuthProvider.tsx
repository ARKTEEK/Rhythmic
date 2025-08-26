import { UserDto } from "../models/User";
import { AuthContext, AuthContextType } from "./AuthContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ReactNode, useEffect, useState } from "react";
import { JwtPayload } from "../models/JwtPayload.ts";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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

      const normalizedUser: UserDto = {
        email: rawUser.email,
        username: rawUser.given_name,
        exp: rawUser.exp,
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
          const normalizedUser: UserDto = {
            email: rawUser.email,
            username: rawUser.given_name,
            exp: rawUser.exp,
          };

          setUser(normalizedUser);
          setIsAuthenticated(true);

          axios.defaults.headers.common["Authorization"] = `Bearer ${ token }`;
        } else {
          logout();
        }
      } catch (e) {
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