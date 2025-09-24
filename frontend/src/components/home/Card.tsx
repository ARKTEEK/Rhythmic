import { ReactNode } from "react";

export const Card = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative group">
      <div
        className="absolute -inset-4 bg-gradient-to-br from-accentLight/20 to-accent/30
                   rounded-[40px] blur-2xl opacity-60"/>

      <div
        className="relative bg-gradient-to-br from-[#fdfdfd] to-[#f1f1f1]
                   border-4 border-white/80 rounded-[30px] p-10
                   shadow-[0_10px_40px_-10px_rgba(255,122,90,0.25),inset_-2px_-2px_6px_#e5e5e5,inset_2px_2px_6px_#ffffff]
                   backdrop-blur-sm">
        { children }
      </div>
    </div>
  );
};
