import { ArrowLeft } from "lucide-react";

interface SidePanelProps {
  open: boolean;
  widthClass: string;
  title: string;
  accentSoft?: string;
  accentText?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function SidePanel({
  open,
  widthClass,
  title,
  accentSoft,
  accentText,
  onClose,
  children
}: SidePanelProps) {
  return (
    <div
      className={`
        flex flex-col bg-[#fff9ec] border-black box-style-lg font-mono
        transition-all duration-500 ease-in-out
        ${open ? `${widthClass} border-l-4 opacity-100 ml-4` : "w-0 border-l-0 opacity-0 ml-0"}
        overflow-hidden h-full min-h-full
      `}>
      <div className={`${widthClass} h-full flex flex-col min-h-0`}>
        <div
          className={`
            w-full px-4 py-2 border-b-4 border-black font-extrabold rounded-t-lg
            uppercase tracking-wider flex items-center justify-between shrink-0
            ${accentSoft} ${accentText}
          `}>
          <span className="text-lg">{title}</span>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
