import Spinner from "../../components/common/Spinner.tsx";
import AuthenticatedHomeContent from "../../components/home/AuthenticatedHomeContent.tsx";
import UnauthenticatedHomeContent from "../../components/home/UnauthenticatedHomeContent.tsx";
import { useAuth } from "../../hooks/useAuth.tsx";

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner/>;
  }

  return isAuthenticated ? (
    <AuthenticatedHomeContent/>
  ) : (
    <UnauthenticatedHomeContent/>
  );
};

export default HomePage;
