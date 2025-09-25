import { ReactNode } from "react";

export const Card = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative group">
      <div
        className="absolute"/>
      <div
        className="relative bg-[#ede0d0] shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-lg border-4 border-black p-10">
        { children }
      </div>
    </div>
  );
};
