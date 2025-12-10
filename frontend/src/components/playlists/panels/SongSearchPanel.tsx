import { ArrowLeft, ExternalLink, Plus, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useSongSearch } from "../../../hooks/playlists/useSongSearch.tsx";
import { ProviderPlaylist } from "../../../models/ProviderPlaylist.ts";
import { ProviderTrack } from "../../../models/ProviderTrack.ts";

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
  onSelectSong,
}: SongsSearchPanelProps) {
  const [query, setQuery] = useState("");

  const { results, isLoading, isError } = useSongSearch(
    currentPlaylist.provider,
    currentPlaylist.providerId,
    query
  );

  return (
    <div
      className={`
        flex flex-col bg-[#fff9ec] border-black box-style-lg
        transition-all duration-500 ease-in-out font-mono h-full
        ${open ? "w-[360px] border-l-4 opacity-100 ml-4" : "w-0 border-l-0 opacity-0 ml-0"}
        overflow-hidden
      `}>
      <div className="w-[360px] h-full flex flex-col min-h-0">

        <div className={`w-full px-4 py-2 border-b-4 border-black font-extrabold rounded-t-lg uppercase tracking-wider flex items-center justify-between shrink-0 ${accentSoft} ${accentText}`}>
          <div className="flex items-center gap-2 text-black">
            <span className="text-lg">Search</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md hover:cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-3 bg-[#fff5df] border-b-2 border-black shrink-0">
          <div className="relative w-full">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 py-1.5 text-sm border-2 border-black box-style-sm bg-white focus:outline-none"
              autoFocus={open}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto retro-scrollbar bg-[#fff9ec]">
          {isLoading ? (
            <div className="p-4 text-center italic text-gray-500 text-sm">Loading...</div>
          ) : isError ? (
            <div className="p-4 text-center italic text-red-500 text-sm">Error searching</div>
          ) : results.length === 0 && query.length > 0 ? (
            <div className="p-4 text-center italic text-gray-500 text-sm">No results</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center italic text-gray-400 text-sm">Type to search</div>
          ) : (
            <div className="flex flex-col">
              <div className="flex px-2 py-1 bg-[#ffe9c2] border-b-2 border-black text-xs font-bold uppercase sticky top-0 z-10">
                <div className="flex-1">Results</div>
                <div className="w-14 text-center">Action</div>
              </div>

              {results.map((track, i) => (
                <div
                  key={track.id}
                  className={`
                    flex justify-between items-center px-2 py-1.5 border-b border-black/10
                    ${i % 2 === 0 ? "bg-[#fffaf0]" : "bg-[#fff3e6]"}
                    hover:bg-[#ffe9c2] transition-colors
                  `}>
                  <div className="flex flex-col overflow-hidden mr-2 min-w-0 flex-1">
                    <span className="font-bold truncate text-sm leading-tight" title={track.title}>
                      {track.title}
                    </span>
                    <span className="text-xs text-gray-600 truncate" title={track.artist}>
                      {track.artist}
                    </span>
                  </div>

                  <div className="flex flex-row gap-1 shrink-0">
                    <button
                      onClick={() => onSelectSong(track)}
                      className="p-1 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black box-style-sm hover:cursor-pointer flex items-center justify-center"
                      title="Add to Playlist">
                      <Plus className="w-3.5 h-3.5 text-black" />
                    </button>
                    <button
                      onClick={() => window.open(track.trackUrl)}
                      className="p-1 bg-yellow-400 hover:bg-yellow-500 border-2 border-black box-style-sm hover:cursor-pointer flex items-center justify-center"
                      title="Open Link">
                      <ExternalLink className="w-3.5 h-3.5 text-black" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
