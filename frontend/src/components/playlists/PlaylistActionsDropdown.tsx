import { ChevronDown, History, MoreVertical, RefreshCw, Scissors, Server, Settings, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";

interface PlaylistActionsDropdownProps {
  playlist: ProviderPlaylist;
  onSync: () => void;
  onHistory: () => void;
  onSplit: () => void;
  onTransfer: () => void;
  onConfigureSync: () => void;
  onDelete: () => void;
  isSyncing?: boolean;
}

export default function PlaylistActionsDropdown({
  playlist,
  onSync,
  onHistory,
  onSplit,
  onTransfer,
  onConfigureSync,
  onDelete,
  isSyncing = false,
}: PlaylistActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 400;
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="px-2 sm:px-3 py-1.5 bg-[#f3d99c] hover:bg-[#f1d189] border-2 border-black
                   box-style-md cursor-pointer flex items-center gap-2 font-bold text-xs sm:text-sm
                   uppercase tracking-wide"
        title="Options">
        <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Options</span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? "rotate-180" : ""} hidden sm:inline-block`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 w-56 bg-[#fff9ec] border-2 border-black box-style-md shadow-lg z-50 ${openUpward ? "bottom-full mb-2" : "top-full mt-2"
          }`}>
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onSync);
              }}
              disabled={isSyncing}
              className="w-full px-4 py-2 text-left hover:bg-[#ffe9c2] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              <RefreshCw className={`w-4 h-4 text-[#5cb973] ${isSyncing ? "animate-spin" : ""}`} />
              <span className="font-bold text-sm">Sync Playlist</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onConfigureSync);
              }}
              className="w-full px-4 py-2 text-left hover:bg-[#ffe9c2] flex items-center gap-3 cursor-pointer">
              <Settings className="w-4 h-4 text-[#9b88c7]" />
              <span className="font-bold text-sm">Configure Sync</span>
            </button>

            <div className="h-px bg-black my-1"></div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onHistory);
              }}
              className="w-full px-4 py-2 text-left hover:bg-[#ffe9c2] flex items-center gap-3 cursor-pointer">
              <History className="w-4 h-4 text-[#63d079]" />
              <span className="font-bold text-sm">View History</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onSplit);
              }}
              className="w-full px-4 py-2 text-left hover:bg-[#ffe9c2] flex items-center gap-3 cursor-pointer">
              <Scissors className="w-4 h-4 text-[#9b88c7]" />
              <span className="font-bold text-sm">Split Playlist</span>
            </button>


            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onTransfer);
              }}
              className="w-full px-4 py-2 text-left hover:bg-[#ffe9c2] flex items-center gap-3 cursor-pointer">
              <Server className="w-4 h-4 text-[#40a8d0]" />
              <span className="font-bold text-sm">Transfer Playlist</span>
            </button>

            <div className="h-px bg-black my-1"></div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onDelete);
              }}
              className="w-full px-4 py-2 text-left hover:bg-[#ffebee] flex items-center gap-3 cursor-pointer">
              <Trash2 className="w-4 h-4 text-[#f26b6b]" />
              <span className="font-bold text-sm text-[#f26b6b]">Delete Playlist</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

