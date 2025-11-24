import React from "react";
import { Minus, Music, Plus, X } from "lucide-react";
import { getProviderName } from "../../utils/providerUtils.tsx";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { PlaylistMeta } from "../../hooks/playlists/usePlaylistData.tsx";
import { ProviderTrack } from "../../models/ProviderTrack.ts";

interface PlaylistDetailModalProps {
  playlist: ProviderPlaylist;
  onClose: () => void
  getPlaylistMeta: (id: string, count: number) => PlaylistMeta;
  getSongsForPlaylist: (id: string) => ProviderTrack[]
  onAddSong: (playlistId: string, song: any) => void
  onRemoveSong: (playlistId: string, songId: string) => void
  accent: string
  accentSoft: string
  accentText: string
  isLoadingSongs: boolean
  isSongsError: boolean
}

export default function PlaylistDetailsModal({
                                              playlist,
                                              onClose,
                                              getPlaylistMeta,
                                              getSongsForPlaylist,
                                              onAddSong,
                                              onRemoveSong,
                                              accentSoft,
                                              accentText,
                                              isLoadingSongs,
                                              isSongsError,
                                            }: PlaylistDetailModalProps) {
  const songs = getSongsForPlaylist(playlist.id) || []
  const meta = getPlaylistMeta(playlist.id, songs.length)
  const provider = getProviderName(playlist.provider)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#fff9ec] box-style-lg">
        <div
          className={ `w-full px-4 py-2 border-b-4 border-black font-extrabold rounded-t-lg 
                     uppercase tracking-wider flex items-center justify-between
                     ${ accentSoft } ${ accentText }` }>
          <div className="flex items-center gap-2 text-black">
            <span className="text-lg">{ playlist.title }</span>
          </div>

          <button
            onClick={ onClose }
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md">
            <X className="w-5 h-5 text-white"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="w-full flex gap-4 p-4 bg-[#fff5df] rounded box-style-md border-2 border-black">
            { playlist.thumbnailUrl ? (
              <img
                src={ playlist.thumbnailUrl }
                alt={ playlist.title }
                className="w-32 h-32 border-2 border-black box-style-md object-cover"/>
            ) : (
              <div
                className="w-32 h-32 bg-[#fffaf5] border-2 border-black flex items-center
                           justify-center text-gray-500 box-style-md">
                <Music className="w-10 h-10"/>
              </div>
            ) }

            <div className="flex flex-col justify-between">
              <div>
                <div className="text-lg font-extrabold">{ playlist.title }</div>
                <div className="text-sm italic text-gray-700">
                  { playlist.description || "No description" }
                </div>
              </div>

              <div className="flex gap-2 flex-wrap mt-2">
                <span
                  className="px-2 py-1 bg-[#5cb973] text-black font-bold box-style-sm
                             border-2 border-black">
                  { provider }
                </span>
                <span
                  className="px-2 py-1 bg-[#40a8d0] text-black font-bold box-style-sm
                             border-2 border-black">
                  Tracks: { meta.trackCount }
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col box-style-md bg-[#fff9ec] retro-scrollbar">

            <div
              className="bg-[#f3d99c] border-b-4 border-black rounded-t-lg flex items-center
                         justify-between px-4 py-2 font-extrabold uppercase text-sm">
              <span>Songs ({ songs.length })</span>

              <button
                onClick={ () => onAddSong(playlist.id, null) }
                className="px-2 py-1 bg-[#63d079] hover:bg-[#4ec767] border-2
                           border-black box-style-md text-xs uppercase">
                <Plus className="w-3 h-3 inline-block"/>
              </button>
            </div>

            <div className="max-h-[45vh] overflow-y-auto">

              { isLoadingSongs ? (
                <div className="p-4 text-center italic text-gray-500">
                  Loading songs…
                </div>
              ) : isSongsError ? (
                <div className="p-4 text-center italic text-red-600">
                  Failed to load songs.
                </div>
              ) : songs.length === 0 ? (
                <div className="p-4 text-center italic text-gray-500">
                  No songs in this playlist.
                </div>
              ) : (
                <table className="w-full border-collapse text-sm">

                  <thead className="bg-[#ffe9c2] border-b-4 border-black sticky top-0 z-10">
                  <tr className="h-[36px]">
                    <th className="px-2 text-left w-10">#</th>
                    <th className="px-2 text-left uppercase tracking-wide">Title</th>
                    <th className="px-2 text-left uppercase tracking-wide">Artist</th>
                    <th className="px-2 text-center uppercase tracking-wide w-20">Actions</th>
                  </tr>
                  </thead>

                  <tbody>
                  { songs.map((song, i) => (
                    <tr
                      key={ song.id || i }
                      className={ `
                          ${ i % 2 === 0 ? "bg-[#fffaf0]" : "bg-[#fff3e6]" }
                          hover:bg-[#ffe9c2] transition-all
                        ` }>
                      <td className="px-2 py-1">{ i + 1 }</td>
                      <td className="px-2 py-1 truncate">{ song.title || "Untitled" }</td>
                      <td className="px-2 py-1 truncate">{ song.artist || "Unknown" }</td>

                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={ () => onRemoveSong(playlist.id, song.id) }
                          className="p-1 bg-[#f26b6b] hover:bg-[#e55d5d] box-style-md">
                          <Minus className="w-4 h-4 text-white"/>
                        </button>
                      </td>
                    </tr>
                  )) }
                  </tbody>
                </table>
              ) }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
