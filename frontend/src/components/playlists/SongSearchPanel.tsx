import { ArrowLeft, Link, Plus } from "lucide-react"
import { useState } from "react"
import { ProviderTrack } from "../../models/ProviderTrack.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { useSongSearch } from "../../hooks/playlists/useSongSearch.tsx";

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

  const {
    results,
    isLoading,
    isError
  } = useSongSearch(
    currentPlaylist.provider,
    currentPlaylist.providerId,
    query
  );

  return (
    <div
      className={ `
        flex flex-col bg-[#fff9ec] border-black box-style-lg
        transition-all duration-500 ease-in-out
        ${
        open
          ? "w-[360px] border-l-4 opacity-100 ml-4"
          : "w-0 border-l-0 opacity-0 ml-0"
      } overflow-hidden` }>
      <div className="w-[360px] h-full flex flex-col">
        <div
          className={ `w-full px-4 py-2 border-b-4 border-black font-extrabold rounded-t-lg 
                       uppercase tracking-wider flex items-center justify-between 
                       ${ accentSoft } ${ accentText }` }>
          <div className="flex items-center gap-2 text-black">
            <span className="text-lg">Search</span>
          </div>

          <button
            onClick={ onClose }
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black
                       box-style-md hover:cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-white"/>
          </button>
        </div>

        <div className="p-4 bg-[#fff5df] border-b-2 border-black">
          <input
            type="text"
            placeholder="Search for a song..."
            value={ query }
            onChange={ (e) => setQuery(e.target.value) }
            className="w-full p-2 border-2 border-black box-style-sm bg-white"
            autoFocus={ open }
          />
        </div>

        <div className="flex-1 overflow-y-auto retro-scrollbar">
          { isLoading ? (
            <div className="p-4 text-center italic text-gray-500">
              Loading...
            </div>
          ) : isError ? (
            <div className="p-4 text-center italic text-red-500">
              Error searching tracks
            </div>
          ) : results.length === 0 && query.length > 0 ? (
            <div className="p-4 text-center italic text-gray-500">
              No results found
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center italic text-gray-400">
              Start typing to search...
            </div>
          ) : (
            results.map((track) => (
              <div
                key={ track.id }
                className="flex justify-between items-center p-3 border-b-2 border-black
                           bg-[#fffaf0] hover:bg-[#ffe9c2] transition-all">
                <div className="flex flex-col overflow-hidden mr-2">
                  <span className="font-bold truncate">{ track.title }</span>
                  <span className="text-xs text-gray-700 truncate">
                    { track.artist }
                  </span>
                </div>
                <div className="flex flex-row gap-1">
                  <button
                    onClick={ () => onSelectSong(track) }
                    className="px-2 py-1 bg-[#63d079] hover:bg-[#4ec767] border-2
                             border-black box-style-sm text-xs uppercase shrink-0
                             hover:cursor-pointer">
                    <Plus className="w-4 h-4 text-black"/>
                  </button>
                  <button
                    onClick={ () => window.open(track.trackUrl) }
                    className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 border-2
                             border-black box-style-sm text-xs uppercase shrink-0
                             hover:cursor-pointer">
                    <Link className="w-4 h-4 text-black"/>
                  </button>
                </div>
              </div>
            ))
          ) }
        </div>
      </div>
    </div>
  );
}
