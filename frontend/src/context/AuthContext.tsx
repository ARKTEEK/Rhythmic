import { jwtDecode } from "jwt-decode";
import { UserDto } from "../entities/User.ts";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (token: string) => {
    try {
      const decodedUser = jwtDecode<UserDto>(token);

      const currentTime = Date.now() / 1000;
      if (decodedUser.exp && decodedUser.exp < currentTime) {
        console.warn("Attempted to log in with an expired token. Logging out.");
        logout();
        return;
      }

      setUser(decodedUser);
      setIsAuthenticated(true);
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
        const decodedUser = jwtDecode<UserDto>(token);
        const currentTime = Date.now() / 1000;

        if (decodedUser.exp && decodedUser.exp > currentTime) {
          setUser(decodedUser);
          setIsAuthenticated(true);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          console.log("Token from localStorage expired. Logging out.");
          logout();
        }
      } catch (e) {
        console.error("Failed to decode token from localStorage:", e);
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
