import Window from "../Window.tsx";
import { FaCheck } from "react-icons/fa";

interface SuccessWindowProps {
  successTitle?: string;
  successDescription?: string;
}

export default function SuccessWindow({
                                        successTitle = "Success!",
                                        successDescription = "Action completed."
                                      }: SuccessWindowProps) {
  return (
    <Window
      containerClassName={ "h-[130px] w-[300px]" }
      windowClassName={ "bg-green-50" }
      ribbonClassName={ "bg-green-400" }>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={ `bg-green-400 p-3 box-style-md` }>
            <FaCheck/>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{ successTitle }</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                { successDescription }
              </span>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}