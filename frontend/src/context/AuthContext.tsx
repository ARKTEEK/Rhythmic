import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { UserDto } from "../models/User.ts";
interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <-- New

  const login = (token: string) => {
    try {
      const rawUser = jwtDecode<any>(token);

      const currentTime = Date.now() / 1000;
      if (rawUser.exp && rawUser.exp < currentTime) {
        console.warn("Attempted to log in with an expired token. Logging out.");
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
        const rawUser = jwtDecode<any>(token);
        const currentTime = Date.now() / 1000;

        if (rawUser.exp && rawUser.exp > currentTime) {
          const normalizedUser: UserDto = {
            email: rawUser.email,
            username: rawUser.given_name,
            exp: rawUser.exp,
          };

          setUser(normalizedUser);
          setIsAuthenticated(true);
          axios.defaults.headers.common["Authorization"] = `Bearer token`;
        } else {
          console.log("Token from localStorage expired. Logging out.");
          logout();
        }
      } catch (e) {
        console.error("Failed to decode token from localStorage:", e);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
