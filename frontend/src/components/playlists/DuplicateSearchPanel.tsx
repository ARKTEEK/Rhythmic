import { ArrowLeft, ExternalLink, Play, Square, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProviderPlaylist } from "../../models/ProviderPlaylist";
import { ProviderTrack } from "../../models/ProviderTrack";

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
  currentPlaylist,
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

  const toggleSelection = (track: ProviderTrack) => {
    const key = `${track.id}-${track.position}`;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const sortedDuplicates = useMemo(
    () => [...duplicates].sort((a, b) => {
      const t = a.title.localeCompare(b.title);
      return t !== 0 ? t : a.artist.localeCompare(b.artist);
    }),
    [duplicates]
  );

  const selectedTracks = sortedDuplicates.filter(t =>
    selected.has(`${t.id}-${t.position}`)
  );

  const toggleSelectAll = () => {
    if (selected.size === sortedDuplicates.length) {
      setSelected(new Set());
    } else {
      const allKeys = sortedDuplicates.map(t => `${t.id}-${t.position}`);
      setSelected(new Set(allKeys));
    }
  };

  return (
    <div
      className={`
        flex flex-col bg-[#fff9ec] border-black box-style-lg font-mono
        transition-all duration-500 ease-in-out
        ${open ? "w-[600px] border-l-4 opacity-100 ml-4" : "w-0 border-l-0 opacity-0 ml-0"}
        overflow-hidden h-full min-h-full`}>
      <div className="w-[600px] h-full flex flex-col min-h-0">
        <div
          className={`
            w-full px-7 py-2 border-b-4 border-black font-extrabold rounded-t-lg
            uppercase tracking-wider flex items-center justify-between
            shrink-0
            ${accentSoft} ${accentText}
          `}>
          <div className="flex items-center gap-2 text-black">
            <span className="text-lg">Duplicate Finder</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black
                        box-style-md hover:cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4 bg-[#fff5df] border-b-2 border-black flex items-center
                         justify-between shrink-0">
          <div className="text-sm">
            {isScanning
              ? "Scanning playlist for duplicates…"
              : sortedDuplicates.length === 0
                ? "Run scan to detect duplicates."
                : `Found ${sortedDuplicates.length} duplicate tracks.`}
          </div>

          <div className="flex gap-3">
            <button
              disabled={isScanning}
              onClick={onStartScan}
              className={`
                px-4 py-1 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black
                box-style-md uppercase font-bold flex items-center gap-1 text-sm
                ${isScanning ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"}
              `}>
              <Play className="w-4 h-4 text-black" />
              Start
            </button>

            <button
              disabled={!isScanning}
              onClick={onCancelScan}
              className={`
                px-4 py-1 bg-[#f2b46b] hover:bg-[#e09f55] border-2 border-black
                box-style-md uppercase font-bold flex items-center gap-1 text-sm
                ${!isScanning ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"}
              `}>
              <Square className="w-4 h-4 text-black" />
              Cancel
            </button>
          </div>
        </div>

        {sortedDuplicates.length > 0 && (
          <div className="flex px-2 py-1 bg-[#ffe9c2] border-b-2 border-black text-xs font-bold
                          uppercase sticky top-0 z-10 shrink-0">
            <input
              type="checkbox"
              checked={selected.size === sortedDuplicates.length && sortedDuplicates.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 border-2 border-black mr-3 flex-shrink-0 hover:cursor-pointer"
            />
            <div className="flex-1">Track Details</div>
            <div className="w-8 text-center">Link</div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto retro-scrollbar min-h-0">
          {sortedDuplicates.length === 0 ? (
            <div className="p-4 text-center italic text-gray-500 text-sm">
              {isScanning ? "Scanning..." : "No duplicates found."}
            </div>
          ) : (
            sortedDuplicates.map((track, i) => (
              <div
                key={`${track.id}-${track.position}`}
                className={`
                  flex items-center px-2 py-1.5 border-b border-black/10 text-sm
                  ${i % 2 === 0 ? "bg-[#fffaf0]" : "bg-[#fff3e6]"}
                  hover:bg-[#ffe9c2] transition-colors
                `}>
                <input
                  type="checkbox"
                  checked={selected.has(`${track.id}-${track.position}`)}
                  onChange={() => toggleSelection(track)}
                  className="w-4 h-4 border-2 border-black mr-3 flex-shrink-0 hover:cursor-pointer"
                />

                <div className="flex-1 truncate font-normal min-w-0"
                  title={`${track.artist} - ${track.title}`}>
                  {track.artist} - {track.title}
                </div>

                <button
                  onClick={() => window.open(track.trackUrl)}
                  className="
                    p-1 bg-yellow-400 hover:bg-yellow-500 border-2
                    border-black box-style-sm text-xs uppercase shrink-0 ml-2
                    flex items-center justify-center hover:cursor-pointer"
                  title="Open Link">
                  <ExternalLink className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
            ))
          )}
        </div>

        {sortedDuplicates.length > 0 && !isScanning && (
          <div className="p-3 bg-[#fff5df] flex justify-end gap-2 border-t-4 border-black shrink-0">
            <button
              disabled={selected.size === 0}
              onClick={() => {
                onDeleteSelected(selectedTracks)
                onClose();
                setSelected(new Set());
              }}
              className={`
                px-3 py-1 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black
                box-style-md uppercase font-bold flex items-center gap-1 text-sm
                ${selected.size === 0 ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"}
              `}>
              <Trash2 className="w-4 h-4 text-black" />
              Delete Selected ({selected.size})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
