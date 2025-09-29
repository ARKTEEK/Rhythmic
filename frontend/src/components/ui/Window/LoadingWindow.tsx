import Window from "../Window.tsx";
import { ReactNode, useEffect, useRef, useState } from "react";

type LoadingState = "loading" | "complete" | "error";

interface LoadingWindowProps {
  ribbonClassName?: string;
  windowClassName?: string;
  loadingMessage?: string;
  completeMessage?: string;
  errorMessage?: string;
  loadingSpeed?: number;
  loadingActions?: ReactNode;
  completeActions?: ReactNode;
  errorActions?: ReactNode;
  totalCubes?: number;
  filledCubeClassName?: string;
  emptyCubeClassName?: string;
  onComplete?: () => void;
  onError?: () => void;
}

export default function LoadingWindow({
                                        ribbonClassName = "bg-blue-200",
                                        windowClassName = "bg-brown-50",
                                        loadingSpeed = 1000,
                                        loadingMessage = "Loading...",
                                        completeMessage = "Complete",
                                        errorMessage = "Something went wrong",
                                        loadingActions,
                                        completeActions,
                                        errorActions,
                                        totalCubes = 10,
                                        filledCubeClassName = "bg-orange-500",
                                        emptyCubeClassName = "bg-brown-200",
                                        onComplete,
                                        onError,
                                      }: LoadingWindowProps) {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<LoadingState>("loading");
  const prevState = useRef<LoadingState>(state);
  const filledCubes = Math.round((progress / 100) * totalCubes);

  useEffect(() => {
    if (state !== "loading") return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setState(Math.random() > 0.2 ? "complete" : "error"), 500);
          return 100;
        }
        return p + 10;
      });
    }, loadingSpeed);

    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (prevState.current !== state) {
      if (state === "complete" && onComplete) {
        onComplete();
      }
      if (state === "error" && onError) {
        onError();
      }
      prevState.current = state;
    }
  }, [state, onComplete, onError]);

  return (
    <Window
      ribbonClassName={ ribbonClassName }
      windowClassName={ windowClassName }>
      <div className="flex flex-col items-center gap-4">
        <span className="text-brown-900 font-semibold">
          { state === "loading" && loadingMessage }
          { state === "complete" && completeMessage }
          { state === "error" && errorMessage }
        </span>

        { state === "loading" && (
          <div className="flex gap-1 border border-brown-900 p-1 bg-brown-100 rounded">
            { Array.from({ length: totalCubes }).map((_, i) => (
              <div
                key={ i }
                className={ `w-6 h-6 transition-colors duration-300 ${
                  i < filledCubes ? filledCubeClassName : emptyCubeClassName
                }` }
              />
            )) }
          </div>
        ) }

        <div className="flex gap-2">
          { state === "loading" && loadingActions }
          { state === "complete" && completeActions }
          { state === "error" && errorActions }
        </div>
      </div>
    </Window>
  );
}
