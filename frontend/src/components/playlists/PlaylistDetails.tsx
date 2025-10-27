import React from "react";
import { FaPlus } from "react-icons/fa";
import SongListItem from "./SongListItem.tsx";
import { ProviderTrack } from "../../models/ProviderTrack.ts";
import LoadingWindow from "../ui/Window/LoadingWindow.tsx";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";

interface PlaylistDetailsProps {
  playlist: ProviderPlaylist;
  getPlaylistMeta: (playlistId: string, fallbackTrackCount: number) => {
    lengthText: string;
    updatedText: string;
    trackCount: number;
  };
  getSongsForPlaylist: (playlistId: string) => ProviderTrack[];
  onAddSong: (playlistId: string) => void;
  onRemoveSong: (playlistId: string, songId: string) => void;
  accent: string;
  accentSoft: string;
  isLoadingSongs: boolean;
  isSongsError: boolean;
}

export default function PlaylistDetails({
                                          playlist,
                                          getPlaylistMeta,
                                          getSongsForPlaylist,
                                          onAddSong,
                                          onRemoveSong,
                                          accent,
                                          accentSoft,
                                          isLoadingSongs,
                                          isSongsError,
                                        }: PlaylistDetailsProps) {

  const meta = getPlaylistMeta(playlist.id, playlist.itemCount);
  const songs = getSongsForPlaylist(playlist.id);

  const renderSongContent = () => {
    if (isLoadingSongs) {
      return (
        <div className="flex items-center justify-center h-full">
          <LoadingWindow
            status="loading"
            loadingMessage="Loading tracks..."
            ribbonClassName={ accent }
            windowClassName={ accentSoft }
          />
        </div>
      );
    }

    if (isSongsError) {
      return (
        <div className="flex items-center justify-center h-full">
          <LoadingWindow
            status="error"
            errorMessage="Failed to load tracks."
            ribbonClassName="bg-red-200"
            windowClassName="bg-red-50"
          />
        </div>
      );
    }

    if (songs.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-brown-900 opacity-70">
          This playlist is empty.
        </div>
      );
    }

    return (
      <ul className="space-y-2">
        { songs.map((song) => (
          <SongListItem
            key={ song.id }
            song={ song }
            playlistId={ playlist.id }
            onRemoveSong={ onRemoveSong }
          />
        )) }
      </ul>
    );
  };

  return (
    <div className="font-mono box-style-lg bg-white border border-brown-800 rounded-md shadow-sm p-0 overflow-hidden">
      <div className={ `w-full ${ accent } border-b border-brown-800 px-4 py-2 flex items-center justify-between` }>
        <div className="text-brown-900 font-bold uppercase tracking-wide">Playlist Details</div>
        <div className="text-[13px] text-brown-900 truncate uppercase tracking-wider">Updated: { meta.updatedText }</div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <img
              src={ playlist.thumbnailUrl }
              alt={ playlist.title }
              className="w-[72px] h-[72px] rounded-md border border-brown-800 object-cover"
            />
            <div>
              <div className="text-2xl font-bold text-brown-900">{ playlist.title }</div>
              <div className={ `text-sm text-brown-900 truncate uppercase tracking-wider inline-block px-2 py-0.5 rounded ${ accentSoft }` }>
                { meta.trackCount } TRKS · { meta.lengthText }
              </div>
            </div>
          </div>
          <button
            onClick={ () => onAddSong(playlist.id) }
            className="box-style-md p-2 border border-brown-800 bg-white text-brown-900 hover:bg-brown-100 rounded-md">
            <FaPlus/>
          </button>
        </div>

        <div className={ `mt-4 box-style-md ${ accentSoft } border border-brown-800 p-3 rounded-md h-[60vh] overflow-y-auto retro-scrollbar` }>
          <ul className="space-y-2">
            { renderSongContent() }
          </ul>
        </div>
      </div>
    </div>
  );
}
