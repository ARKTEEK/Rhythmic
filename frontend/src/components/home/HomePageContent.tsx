import { useAuth } from "../../context/AuthContext";
import AuthenticatedHomeContent from "./AuthenticatedHomeContent";
import UnauthenticatedHomeContent from "./UnauthenticatedHomeContent";

const HomePageContent = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <AuthenticatedHomeContent />
  ) : (
    <UnauthenticatedHomeContent />
  );
};

export default HomePageContent;
