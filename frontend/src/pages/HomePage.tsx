import Spinner from "../components/common/Spinner";
import AuthenticatedHomeContent from "../components/home/AuthenticatedHomeContent";
import UnauthenticatedHomeContent from "../components/home/UnauthenticatedHomeContent";
import { useAuth } from "../hooks/useAuth.tsx";

const HomePage = () => {
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

export default HomePage;
