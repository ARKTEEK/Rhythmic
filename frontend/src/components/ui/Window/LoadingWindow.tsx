import { ReactNode, useEffect, useRef, useState } from "react";
import Window from "../Window.tsx";
import ErrorWindow from "./ErrorWindow.tsx";
import SuccessWindow from "./SuccessWindow.tsx";

type LoadingState = "loading" | "complete" | "error";

interface LoadingWindowProps {
  ribbonClassName?: string;
  windowClassName?: string;
  loadingMessage?: string;
  completeMessage?: string;
  errorMessage?: string;
  loadingSpeed?: number;
  loadingActions?: ReactNode;
  totalCubes?: number;
  filledCubeClassName?: string;
  emptyCubeClassName?: string;
  onComplete?: () => void;
  onError?: () => void;
  onProgressComplete?: () => void;
  status: LoadingState;
}

export default function LoadingWindow({
                                        ribbonClassName = "bg-fuchsia-200",
                                        windowClassName = "bg-fuchsia-50",
                                        loadingSpeed = 100,
                                        loadingMessage = "Processing...",
                                        completeMessage = "Success",
                                        errorMessage = "Failure",
                                        loadingActions,
                                        totalCubes = 10,
                                        filledCubeClassName = "bg-fuchsia-500",
                                        emptyCubeClassName = "bg-gray-200",
                                        onComplete,
                                        onError,
                                        onProgressComplete,
                                        status,
                                      }: LoadingWindowProps) {
  const [progress, setProgress] = useState(0);
  const filledCubes = Math.round((progress / 100) * totalCubes);
  const prevStatusRef = useRef<LoadingState>(status);

  useEffect(() => {
    if (status !== "loading") return;

    const interval = setInterval(() => {
      setProgress((p) => {
        const newProgress = p + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          if (onProgressComplete) {
            onProgressComplete();
          }
          return 100;
        }
        return newProgress;
      });
    }, loadingSpeed);

    return () => clearInterval(interval);
  }, [status, loadingSpeed, onProgressComplete]);

  useEffect(() => {
    if (prevStatusRef.current !== status) {
      if (status === "complete" && onComplete) {
        onComplete();
      }
      if (status === "error" && onError) {
        onError();
      }
      prevStatusRef.current = status;
    }
  }, [status, onComplete, onError]);

  if (status === "error") {
    return <ErrorWindow errorDescription={ errorMessage }/>;
  }

  if (status === "complete") {
    return <SuccessWindow successDescription={ completeMessage }/>;
  }

  return (
    <Window
      containerClassName={"h-[160px] w-[320px]"}
      ribbonClassName={ ribbonClassName }
      windowClassName={ windowClassName }>
      <div className="flex flex-col items-center gap-4">
                <span className="text-brown-900 font-semibold">
                    { loadingMessage }
                </span>
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
        <div className="flex gap-2">
          { loadingActions }
        </div>
      </div>
    </Window>
  );
}
