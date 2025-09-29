import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { handleOAuthCallback } from "../../services/OAuthService.ts";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const alreadyCalled = useRef(false);
  const { provider } = useParams<{ provider: string }>();

  const { mutate } = useMutation({
    mutationFn: ({ code, state, jwt }: { code: string; state: string; jwt: string }) =>
      handleOAuthCallback(provider as "google" | "spotify", code, state, jwt),
    onSuccess: () => {
      navigate("/oauth/complete", { state: { allowOAuth: true } });
    },
    onError: () => {
      navigate("/oauth/error", { state: { allowOAuth: true } });
    }
  });

  useEffect(() => {
    if (alreadyCalled.current || !provider) return;
    alreadyCalled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const jwt = localStorage.getItem("token");

    if (!code || !state || !jwt) {
      navigate("/oauth/error", { state: { allowOAuth: true } });
      return;
    }

    mutate({ code, state, jwt });
  }, [provider, mutate, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center text-white max-w-lg">
        <h1 className="text-4xl font-extrabold text-red-400 mb-2">
          Linking your Account...
        </h1>
        <p className="text-gray-300 mb-6">Wait a few seconds...</p>
      </div>
    </div>
  );
};