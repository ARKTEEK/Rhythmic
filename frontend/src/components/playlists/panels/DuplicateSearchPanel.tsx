import { ExternalLink, Play, Square, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProviderPlaylist } from "../../../models/ProviderPlaylist";
import { ProviderTrack } from "../../../models/ProviderTrack";
import { SidePanel } from "../../ui/Window/SidePanel";

interface DuplicateSearchPanelProps {
  open: boolean;
  onClose: () => void;
  accentSoft?: string;
  accentText: string;
  currentPlaylist: ProviderPlaylist;
  isScanning: boolean | undefined;
  onStartScan: () => void;
  onCancelScan: () => void;
  duplicates: ProviderTrack[];
  onDeleteSelected: (tracks: ProviderTrack[]) => void;
}

export default function DuplicateSearchPanel({
  open,
  onClose,
  accentSoft,
  accentText,
  isScanning,
  onStartScan,
  onCancelScan,
  duplicates,
  onDeleteSelected
}: DuplicateSearchPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSelected(new Set());
    }
  }, [open]);

  const sorted = useMemo(
    () => [...duplicates].sort((a, b) => a.title.localeCompare(b.title) || a.artist.localeCompare(b.artist)),
    [duplicates]
  );

  const toggle = (t: ProviderTrack) => {
    const k = `${t.id}-${t.position}`;
    setSelected(s => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  const selectedTracks = sorted.filter(t => selected.has(`${t.id}-${t.position}`));

  return (
    <SidePanel
      open={open}
      widthClass="w-[600px]"
      title="Duplicate Finder"
      accentSoft={accentSoft}
      accentText={accentText}
      onClose={onClose}>
      <div className="p-2 sm:p-4 bg-[#fff5df] border-b-2 border-black flex flex-col sm:flex-row
                      items-start sm:items-center justify-between shrink-0 gap-2">
        <div className="text-xs sm:text-sm">
          {isScanning
            ? "Scanning playlist for duplicates…"
            : sorted.length === 0
              ? "Run scan to detect duplicates."
              : `Found ${sorted.length} duplicate tracks.`}
        </div>

        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            disabled={isScanning}
            onClick={onStartScan}
            className="px-2 sm:px-4 py-1 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black box-style-md
                       uppercase font-bold flex items-center gap-1 text-[10px] sm:text-sm cursor-pointer
                       disabled:cursor-not-allowed disabled:opacity-50 flex-1 sm:flex-initial justify-center">
            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Start</span>
          </button>

          <button
            disabled={!isScanning}
            onClick={onCancelScan}
            className="px-2 sm:px-4 py-1 bg-[#f2b46b] hover:bg-[#e09f55] border-2 border-black box-style-md
                       uppercase font-bold flex items-center gap-1 text-[10px] sm:text-sm cursor-pointer
                       disabled:cursor-not-allowed disabled:opacity-50 flex-1 sm:flex-initial justify-center">
            <Square className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cancel</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto retro-scrollbar">
        {sorted.map((t, i) => (
          <div
            key={`${t.id}-${t.position}`}
            className={`${i % 2 === 0 ? "bg-[#fffaf0]" : "bg-[#fff3e6]"} flex items-center px-2 py-1.5`}>
            <input
              type="checkbox"
              checked={selected.has(`${t.id}-${t.position}`)}
              onChange={() => toggle(t)}
              className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-black mr-2 sm:mr-3 cursor-pointer flex-shrink-0"
            />
            <div className="flex-1 truncate text-xs sm:text-sm">
              {t.artist} - {t.title}
            </div>
            <button
              onClick={() => window.open(t.trackUrl)}
              className="p-0.5 sm:p-1 bg-yellow-400 hover:bg-yellow-500 border-2 border-black
                         box-style-sm ml-2 hover:cursor-pointer flex-shrink-0">
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {sorted.length > 0 && !isScanning && (
        <div className="p-2 sm:p-3 bg-[#fff5df] flex justify-end gap-2 border-t-4 border-black shrink-0">
          <button
            disabled={selected.size === 0}
            onClick={() => {
              onDeleteSelected(selectedTracks);
              setSelected(new Set());
              onClose();
            }}
            className="px-2 sm:px-3 py-1 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md
                       uppercase font-bold flex items-center gap-1 text-[10px] sm:text-sm cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed">
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            Delete Selected ({selected.size})
          </button>
        </div>
      )}
    </SidePanel>
  );
}
