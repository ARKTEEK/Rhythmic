import { FaQuestion } from "react-icons/fa";
import Window from "../Window";
import React from "react";

interface ConfirmWindowProps {
  confirmTitle?: string;
  confirmMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
  height?: string;
}

export default function ConfirmWindow({
                                        confirmTitle = "Are you sure?",
                                        confirmMessage = "Please confirm your action.",
                                        onConfirm,
                                        onCancel,
                                        height = "170px",
                                      }: ConfirmWindowProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Window
        containerClassName={`h-[${height}] w-[380px]`}
        windowClassName="bg-yellow-50"
        ribbonClassName="bg-yellow-400">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-400 p-3 box-style-md">
              <FaQuestion/>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{ confirmTitle }</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{ confirmMessage }</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-2">
          <button
            onClick={ onCancel }
            className="box-style-md px-5 py-1.5 text-sm font-medium bg-gray-200 text-gray-800
                       hover:bg-gray-300 hover:cursor-pointer">
            Cancel
          </button>
          <button
            onClick={ onConfirm }
            className="box-style-md px-5 py-1.5 text-sm font-medium bg-yellow-400 text-gray-900
                       hover:bg-yellow-500 hover:cursor-pointer">
            OK
          </button>
        </div>
      </Window>
    </div>
  );
}
