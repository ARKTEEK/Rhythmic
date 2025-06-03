import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleGoogleOAuthCallback } from "./services/AuthService";

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

  return <div>{error ?? "Linking your Google account..."}</div>;
};

export default GoogleOAuthCallback;
