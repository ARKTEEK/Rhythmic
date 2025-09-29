import { Link } from "react-router-dom";
import Button from "../../components/ui/Button.tsx";
import Logo from "../../components/common/Logo.tsx";
import Window from "../../components/ui/Window.tsx";

export default function HomePage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center">
      <div
        className="w-full max-w-2xl mx-auto flex flex-col items-center text-center
                   relative z-10">
        <Window
          windowClassName={ "bg-green-50" }
          ribbonClassName={ "bg-green-200" }>
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
            Create, manage, and share playlists with ease
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

          <div className="p-4 bg-white/50 rounded-2xl border-2 border-dashed border-black">
            <p className="text-sm text-[#6C6C6C] font-medium"> By using RHYTHMIC, you agree to
                                                               our{ " " }
              <Link
                to="/terms"
                className="font-black hover:underline transition-colors duration-200"> TERMS </Link>
              { " " }and{ " " }
              <Link
                to="/policy"
                className="font-black hover:underline transition-colors duration-200"> POLICY </Link>
            </p>
          </div>
        </Window>
      </div>
    </div>
  );
};