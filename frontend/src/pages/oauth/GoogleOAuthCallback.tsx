import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleGoogleOAuthCallback } from "../../services/AuthService";
import { useOAuthAccess } from "../../context/OAuthFlowContext.tsx";

const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
  const { setAllowAccess } = useOAuthAccess();
  const [error, setError] = useState<string | null>(null);
  const alreadyCalled = useRef(false);

  useEffect(() => {
    if (alreadyCalled.current) return;
    alreadyCalled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const jwt = localStorage.getItem("token");

    if (!code || !state || !jwt) {
      setError("Missing required parameters.");
      setAllowAccess(true);
      navigate("/oauth/error", { state: { allowOAuth: true } });
      return;
    }

    const doCallback = async () => {
      try {
        await handleGoogleOAuthCallback(code, state, jwt);
        setAllowAccess(true);
        navigate("/oauth/complete", { state: { allowOAuth: true } });
      } catch (err) {
        console.error("OAuth callback failed:", err);
        setAllowAccess(true);
        navigate("/oauth/error", { state: { allowOAuth: true } });
      }
    };

    doCallback();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="relative z-10 w-full max-w-lg text-white text-center">
        <h1 className="text-4xl font-extrabold text-red-400 mb-2">
          Linking your Account...
        </h1>
        <p className="text-gray-300 mb-6">Wait a few seconds for redirect...</p>
      </div>
    </div>

  );
};

export default GoogleOAuthCallback;
