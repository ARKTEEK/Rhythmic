import Window from "../Window.tsx";
import { FaExclamation } from "react-icons/fa";

interface ErrorWindowProps {
  errorTitle?: string;
  errorDescription?: string;
}

export default function ErrorWindow({
                                      errorTitle = "Error!",
                                      errorDescription = "An error has occured..."
                                    }: ErrorWindowProps) {
  return (
    <Window
      containerClassName={ "h-[130px] w-[340px]" }
      windowClassName={ "bg-red-50" }
      ribbonClassName={ "bg-red-400" }>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={ `bg-red-400 p-3 box-style-md` }>
            <FaExclamation/>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{ errorTitle }</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                { errorDescription }
              </span>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}