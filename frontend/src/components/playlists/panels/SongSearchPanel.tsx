import { ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { useSongSearch } from "../../../hooks/playlists/useSongSearch.tsx";
import { ProviderPlaylist } from "../../../models/ProviderPlaylist.ts";
import { ProviderTrack } from "../../../models/ProviderTrack.ts";
import { SearchBar } from "../../ui/SearchBar.tsx";
import { SidePanel } from "../../ui/Window/SidePanel.tsx";

interface SongsSearchPanelProps {
  currentPlaylist: ProviderPlaylist;
  accentSoft?: string;
  accentText: string;
  open: boolean;
  onClose: () => void;
  onSelectSong: (track: ProviderTrack) => void;
}

export default function SongSearchPanel({
  currentPlaylist,
  accentSoft,
  accentText,
  open,
  onClose,
  onSelectSong
}: SongsSearchPanelProps) {
  const [query, setQuery] = useState("");

  const { results, isLoading, isError } = useSongSearch(
    currentPlaylist.provider,
    currentPlaylist.providerId,
    query
  );

  return (
    <SidePanel
      open={open}
      widthClass="w-[360px]"
      title="Search"
      accentSoft={accentSoft}
      accentText={accentText}
      onClose={onClose}>
      <div className="p-2 sm:p-3 bg-[#fff5df] border-b-2 border-black shrink-0">
        <SearchBar
          value={query}
          onChange={setQuery}
          autoFocus={open}
        />
      </div>

      <div className="flex-1 overflow-y-auto retro-scrollbar bg-[#fff9ec] max-h-[70vh]">
        {isLoading && (
          <div className="p-4 text-center italic text-gray-500 text-xs sm:text-sm">Loading...</div>
        )}

        {isError && (
          <div className="p-4 text-center italic text-red-500 text-xs sm:text-sm">Error searching</div>
        )}

        {!isLoading && !isError && results.map((t, i) => (
          <div
            key={t.id}
            className={`${i % 2 === 0 ? "bg-[#fffaf0]" : "bg-[#fff3e6]"}
                       flex justify-between items-center px-2 py-1.5 border-b border-black/10`}>
            <div className="flex flex-col overflow-hidden mr-2 min-w-0 flex-1">
              <span className="font-bold truncate text-xs sm:text-sm">{t.title}</span>
              <span className="text-[10px] sm:text-xs text-gray-600 truncate">{t.artist}</span>
            </div>

            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onSelectSong(t)}
                className="p-0.5 sm:p-1 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black box-style-sm">
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                onClick={() => window.open(t.trackUrl)}
                className="p-0.5 sm:p-1 bg-yellow-400 hover:bg-yellow-500 border-2 border-black box-style-sm">
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}
