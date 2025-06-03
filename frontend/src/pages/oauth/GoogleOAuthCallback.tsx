import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleGoogleOAuthCallback } from "../../services/AuthService";

const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
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
      console.warn("Missing code, state, or JWT!");
      setError("Missing required parameters.");
      navigate("/oauth/error");
      return;
    }

    const controller = new AbortController();

    const doCallback = async () => {
      try {
        await handleGoogleOAuthCallback(code, state, jwt, controller.signal);
        navigate("/oauth/complete");
      } catch (err) {
        console.error("OAuth callback failed:", err);
        navigate("/oauth/error");
      }
    };

    doCallback();

    return () => controller.abort();
  }, [navigate]);

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-red-500 opacity-20 blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg text-white text-center">
        <p className="text-xl font-medium">
          {error ?? "Linking your Google account..."}
        </p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
