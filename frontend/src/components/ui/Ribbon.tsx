import React from "react";

interface RibbonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function Ribbon({ className = "", children }: RibbonProps) {
  return (
    <div
      className={ `flex justify-end items-center rounded-t-lg 
                   border-b-2 border-brown-800 px-3 py-1 ${ className }` }>
      { children ? (
        children
      ) : (
        <div className="flex gap-2 text-brown-900">
          <span
            className="w-3 h-3 border border-brown-900 cursor-pointer hover:bg-black"></span>
          <span
            className="w-3 h-3 border border-brown-900 cursor-pointer hover:bg-black"></span>
        </div>
      ) }
    </div>
  );
}