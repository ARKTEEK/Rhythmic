import { useAuth } from "../context/AuthContext.tsx";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet/> : <Navigate to="/"/>;
}