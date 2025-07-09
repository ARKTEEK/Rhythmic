import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { handleGoogleOAuthCallback } from "../../services/AuthService";
import { useOAuthAccess } from "../../context/OAuthFlowContext.tsx";
import { useMutation } from "@tanstack/react-query";

const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
  const { setAllowAccess } = useOAuthAccess();
  const alreadyCalled = useRef(false);

  const { mutate } = useMutation({
    mutationFn: ({ code, state, jwt }: { code: string; state: string; jwt: string }) =>
      handleGoogleOAuthCallback(code, state, jwt),
    onSuccess: () => {
      setAllowAccess(true);
      navigate("/oauth/complete", { state: { allowOAuth: true } });
    },
    onError: (err) => {
      console.error("OAuth callback failed:", err);
      setAllowAccess(true);
      navigate("/oauth/error", { state: { allowOAuth: true } });
    }
  });

  useEffect(() => {
    if (alreadyCalled.current) return;
    alreadyCalled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const jwt = localStorage.getItem("token");

    if (!code || !state || !jwt) {
      setAllowAccess(true);
      navigate("/oauth/error", { state: { allowOAuth: true } });
      return;
    }

    mutate({ code, state, jwt });
  }, [mutate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center text-white max-w-lg">
        <h1 className="text-4xl font-extrabold text-red-400 mb-2">Linking your Account...</h1>
        <p className="text-gray-300 mb-6">Wait a few seconds...</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;