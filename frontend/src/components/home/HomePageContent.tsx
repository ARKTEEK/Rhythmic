import { useAuth } from "../../context/AuthContext";
import Spinner from "../common/Spinner";
import AuthenticatedHomeContent from "./AuthenticatedHomeContent";
import UnauthenticatedHomeContent from "./UnauthenticatedHomeContent";

const HomePageContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  return isAuthenticated ? (
    <AuthenticatedHomeContent />
  ) : (
    <UnauthenticatedHomeContent />
  );
};

export default HomePageContent;
