import React from "react";
import { FaCheckSquare, FaMusic, FaRegSquare } from "react-icons/fa";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { getProviderName } from "../../utils/providerUtils.tsx";

interface PlaylistListItemProps {
  playlist: ProviderPlaylist;
  idx: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onListItemClick: (e: React.MouseEvent<HTMLButtonElement>, playlistId: string) => void;
  getPlaylistMeta: (playlistId: string, fallbackTrackCount: number) => {
    lengthText: string;
    updatedText: string;
    trackCount: number;
  };
}

export default function PlaylistListItem({
                                           playlist,
                                           idx,
                                           isSelected,
                                           onToggleSelect,
                                           onListItemClick,
                                           getPlaylistMeta
                                         }: PlaylistListItemProps) {
  const meta = getPlaylistMeta(playlist.id, playlist.itemCount);

  const windowPalette = [
    "from-blue-50 to-blue-100",
    "from-green-50 to-green-100",
    "from-purple-50 to-purple-100",
    "from-pink-50 to-pink-100",
    "from-yellow-50 to-yellow-100",
    "from-cyan-50 to-cyan-100"
  ];
  const accentSoft = windowPalette[idx % windowPalette.length];
  return (

    <li key={ playlist.id }>
      <button
        onClick={ (e) => onListItemClick(e, playlist.id) }
        className={ `
          group w-full font-mono
          flex items-center justify-between gap-4 p-3 text-left
          border-2 border-black rounded-lg
          bg-gradient-to-b ${ accentSoft }
          ${
          isSelected
            ? "translate-y-[2px] translate-x-[2px] shadow-none"
            : "shadow-[3px_3px_0_black] active:translate-y-[1px] active:translate-x-[1px] " +
            "active:shadow-[2px_2px_0_black]"
        }
        ` }>
        <div
          onClick={ (e) => {
            e.stopPropagation();
            onToggleSelect(playlist.id);
          } }
          className={ `
            relative w-12 h-12 rounded border-2 border-black // <-- RETRO: Chunky border
            bg-white overflow-hidden cursor-pointer flex-shrink-0
          ` }>
          { playlist.thumbnailUrl ? (
            <img
              src={ playlist.thumbnailUrl }
              alt={ playlist.title }
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brown-100 flex items-center justify-center text-brown-500 text-2xl">
              <FaMusic/>
            </div>
          ) }
          <div
            className={ `
              absolute inset-0 flex items-center justify-center text-white text-xl
              transition-all duration-150
              ${
              isSelected
                ? "bg-black/60"
                : "bg-black/40 opacity-0 group-hover:opacity-100"
            }
            ` }>
            { isSelected ? <FaCheckSquare/> : <FaRegSquare/> }
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-bold text-black truncate leading-tight tracking-tight">
            { playlist.title }
          </div>
          <div className="text-xs text-black/70 mt-1 truncate uppercase tracking-wider">
            { meta.trackCount } TRKS · { getProviderName(playlist.provider) }
          </div>
        </div>

        <span
          className={ ` 
          hidden sm:inline-flex items-center justify-center w-[80px] h-[24px] text-xs font-bold rounded
          border-2 border-black bg-white/80 text-black shadow-[2px_2px_0_black] uppercase tracking-wider text-center` }>
          { playlist.privacyStatus }
        </span>

      </button>
    </li>
  )
}