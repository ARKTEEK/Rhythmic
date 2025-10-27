import React from "react";
import { FaExternalLinkAlt, FaTrash } from "react-icons/fa";
import { ProviderTrack } from "../../models/ProviderTrack.ts";
import { formatDuration } from "../../utils/playlistUtils.tsx";

interface SongListProps {
  song: ProviderTrack;
  playlistId: string;
  onRemoveSong: (playlistId: string, songId: string) => void;
}

export default function SongListItem({
                                       song,
                                       playlistId,
                                       onRemoveSong,
                                     }: SongListProps) {
  return (
    <li
      key={ song.id }
      className="group flex items-center justify-between gap-4 py-2 px-1 hover:bg-gray-50 transitiond">
      { song.thumbnailUrl ? (
        <img
          src={ song.thumbnailUrl }
          alt={ song.title }
          className="w-14 h-14 object-cover flex-shrink-0 box-style-md"/>
      ) : (
        <div className="w-14 h-14 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-sm flex-shrink-0">
          No Image
        </div>
      ) }

      <div className="flex-1 ml-2 min-w-0">
        <div className="text-base font-semibold text-gray-900 truncate">{ song.title }</div>
        <div className="text-sm text-gray-700 truncate">
          { song.artist } · { formatDuration(song.durationMs) }
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={ song.id || "#" }
          target="_blank"
          rel="noreferrer"
          className="box-style-md p-1.5 border border-brown-800 bg-white text-brown-900 hover:bg-brown-100 rounded-md"
          title="Open in YouTube">
          <FaExternalLinkAlt/>
        </a>
        <button
          onClick={ () => onRemoveSong(playlistId, song.id) }
          className="box-style-md p-1.5 border border-brown-800 bg-red-100 text-red-700 hover:bg-red-200 rounded-md"
          title="Remove song">
          <FaTrash/>
        </button>
      </div>
    </li>
  );
}
