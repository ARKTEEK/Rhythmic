import Spinner from "../../components/common/Spinner.tsx";
import { useAuth } from "../../hooks/useAuth.tsx";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/button/Button.tsx";
import { Logo } from "../../components/common/Logo.tsx";
import { Terms } from "../../components/home/Terms.tsx";
import { Card } from "../../components/home/Card.tsx";

const HomePage = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Spinner/>;
  }

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-[#ffe8dc] to-[#ffd6c7] flex
                 items-center justify-center">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center relative z-10">
        <Card>
          <div className="relative mb-6">
            <Logo
              size="lg"
              underline/>
          </div>

          <h1 className="text-2xl font-bold text-neutralGray mb-2">
            Seamless Playlist Management
          </h1>

          <p
            className="text-lg text-neutralGray/80 font-medium mb-8 border-2 border-dashed
                       border-accent/30 p-3 rounded-2xl bg-white/50 backdrop-blur-sm">
            Create, organize, and share your favorite playlists with ease
          </p>

          <div className="mb-8">
            <Link to="/auth">
              <Button
                label="Sign in to Continue"
                type="button"
                variant="active"
                size="medium"/>
            </Link>
          </div>
          <Terms/>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
