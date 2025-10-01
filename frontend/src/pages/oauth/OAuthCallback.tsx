import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { handleOAuthCallback } from "../../services/OAuthService.ts";
import LoadingWindow from "../../components/ui/Window/LoadingWindow.tsx";

type LoadingState = "loading" | "complete" | "error";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState<LoadingState>("loading");
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const alreadyCalled = useRef(false);
  const { provider } = useParams<{ provider: string }>();

  const { mutate } = useMutation({
    mutationFn: ({ code, state, jwt }: { code: string; state: string; jwt: string }) =>
      handleOAuthCallback(provider as "google" | "spotify", code, state, jwt),
    onSuccess: () => {
      setApiStatus("complete");
    },
    onError: (error) => {
      console.error("OAuth callback error:", error);
      setApiStatus("error");
    },
  });

  useEffect(() => {
    if (alreadyCalled.current || !provider) {
      return;
    }
    alreadyCalled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const jwt = localStorage.getItem("token");

    if (!code || !state || !jwt) {
      setApiStatus("error");
      return;
    }

    mutate({ code, state, jwt });
  }, [provider, mutate]);

  const handleVisualComplete = () => {
    setIsAnimationComplete(true);
  };

  const effectiveStatus: LoadingState =
    (apiStatus !== "loading" && isAnimationComplete)
      ? apiStatus
      : "loading";

  useEffect(() => {
    if (effectiveStatus === "complete" || effectiveStatus === "error") {
      const timer = setTimeout(() => {
        navigate("/connections");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [effectiveStatus, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingWindow
        status={ effectiveStatus }
        onProgressComplete={ handleVisualComplete }
        loadingMessage={ `Linking your ${ provider } account...` }
        errorMessage="Authentication failed! Please try again...."
        completeMessage="Authentication successful."
      />
    </div>
  );
}
