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
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          flex flex-col bg-[#fff9ec] border-black box-style-lg font-mono
          transition-all duration-500 ease-in-out
          overflow-hidden h-full min-h-full

          /* Desktop: side panel */
          ${!open && "w-0 border-l-0 opacity-0 ml-0"}
          ${open && "lg:border-l-4 lg:opacity-100 lg:ml-4"}
          lg:relative lg:${widthClass}

          /* Mobile: fixed overlay */
          ${open
            ? 'fixed lg:relative inset-y-0 right-0 z-[70] lg:z-auto w-[95vw] max-w-[600px] sm:w-[85vw] opacity-100 border-l-4'
            : 'fixed right-0 w-0 opacity-0'
          }
        `}>
        <div className="w-full h-full flex flex-col min-h-0">
          <div
            className={`
              w-full px-2 sm:px-4 py-2 border-b-4 border-black font-extrabold rounded-t-lg
              uppercase tracking-wider flex items-center justify-between shrink-0
              ${accentSoft} ${accentText}
            `}>
            <span className="text-sm sm:text-lg">{title}</span>
            <button
              onClick={onClose}
              className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md cursor-pointer">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
