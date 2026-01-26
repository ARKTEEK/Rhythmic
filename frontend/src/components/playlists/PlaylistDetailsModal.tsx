import { BrushCleaning, Music, SearchIcon, Trash2, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { ProviderTrack } from "../../models/ProviderTrack.ts";
import { formatDuration } from "../../utils/playlistUtils.tsx";
import { getProviderName } from "../../utils/providerUtils.tsx";
import PlatformIcon from "../ui/Icon/PlatformIcon.tsx";
import Spinner from "../ui/Spinner.tsx";
import DuplicateSearchPanel from "./panels/DuplicateSearchPanel.tsx";
import SongSearchPanel from "./panels/SongSearchPanel.tsx";

interface PlaylistDetailModalProps {
  playlist: ProviderPlaylist;
  onClose: () => void;
  getSongsForPlaylist: (playlist: ProviderPlaylist) => ProviderTrack[];
  onAddSong: (playlist: ProviderPlaylist, track: ProviderTrack) => void;
  onRemoveSong: (playlist: ProviderPlaylist, track: ProviderTrack) => void;
  accentSoft?: string;
  accentText: string;
  isLoadingSongs: boolean;
  isSongsError: boolean;

  isScanning?: boolean;
  currentTrack?: ProviderTrack;
  duplicateTracks?: ProviderTrack[];
  setDuplicateTracks?: React.Dispatch<React.SetStateAction<ProviderTrack[]>>;
  onStartScan?: () => void;
  onCancelScan?: () => void;
}

export default function PlaylistDetailsModal({
  playlist,
  onClose,
  getSongsForPlaylist,
  onAddSong,
  onRemoveSong,
  accentSoft,
  accentText,
  isLoadingSongs,
  isSongsError,
  isScanning,
  currentTrack,
  onStartScan,
  onCancelScan,
  duplicateTracks,
  setDuplicateTracks,
}: PlaylistDetailModalProps) {
  const duplicateIds = useMemo(() => new Set((duplicateTracks || []).map(t => t.id)), [duplicateTracks]);

  const songs = useMemo(() => getSongsForPlaylist(playlist) || [], [getSongsForPlaylist, playlist]);
  const provider = getProviderName(playlist.provider);
  const [isDuplicatePanelOpen, setIsDuplicatePanelOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (setDuplicateTracks) {
      setDuplicateTracks([]);
    }
    onClose();
  };

  useEffect(() => {
    if (!isScanning || !currentTrack || !tableRef.current) {
      return;
    }

    const rows = tableRef.current.querySelectorAll<HTMLTableRowElement>("tbody tr");
    const index = songs.findIndex(s => s.id === currentTrack.id);
    if (index !== -1) {
      rows[index]?.scrollIntoView({ behavior: "instant", block: "end" });
    }
  }, [currentTrack, isScanning, songs]);

  useEffect(() => {
    if (!isScanning && duplicateTracks && duplicateTracks.length > 0) {
      setIsDuplicatePanelOpen(true);
      setIsSearchOpen(false);
    }
  }, [isScanning, duplicateTracks]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono overflow-x-auto">
      <div className="flex items-stretch justify-center w-auto p-2 sm:p-6 md:p-10 transition-all duration-300">
        <div className="relative w-[98vw] sm:w-[90vw] max-w-4xl max-h-[98vh] sm:max-h-fit min-h-fit 
                        flex flex-col bg-[#fff9ec] box-style-lg overflow-hidden shrink-0 transition-all">
          <div className={`w-full px-2 sm:px-4 py-2 border-b-4 border-black font-extrabold rounded-t-lg 
                           uppercase tracking-wider flex items-center justify-between ${accentSoft} ${accentText}`}>
            <div className="flex items-center gap-2 text-black">
              <span className="text-sm sm:text-lg">Playlist</span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md hover:cursor-pointer">
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex flex-col gap-2 sm:gap-4">
            <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 p-2 sm:p-4 bg-[#fff5df] 
                            rounded box-style-md border-2 border-black">
              {playlist.thumbnailUrl ? (
                <img
                  src={playlist.thumbnailUrl}
                  alt={playlist.title}
                  className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-black box-style-md object-cover mx-auto sm:mx-0" />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#fffaf5] border-2 border-black 
                                flex items-center justify-center text-gray-500 box-style-md mx-auto sm:mx-0">
                  <Music className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              )}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="text-base sm:text-lg font-extrabold">{playlist.title}</div>
                  <div className="text-xs sm:text-sm italic text-gray-700">
                    {playlist.description || "No description"}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  <PlatformIcon
                    providerName={provider}
                    label={provider} />
                </div>
              </div>
            </div>

            <div
              className="w-full flex flex-col box-style-md bg-[#fff9ec] retro-scrollbar h-full"
              ref={tableRef}>
              <div className="bg-[#f3d99c] border-b-4 border-black rounded-t-lg flex items-center 
                              justify-between px-2 sm:px-4 py-2 font-extrabold uppercase text-xs sm:text-sm">
                <span>Tracks ({songs.length})</span>

                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={() => {
                      setIsDuplicatePanelOpen(true);
                      setIsSearchOpen(false);
                    }}
                    className="px-1.5 sm:px-2 py-1 bg-[#63d079] hover:bg-[#4ec767] box-style-md 
                               uppercase font-extrabold hover:cursor-pointer">
                    <BrushCleaning className="w-3 h-3 sm:w-4 sm:h-4 inline-block" />
                  </button>
                  <button
                    onClick={() => {
                      setIsSearchOpen(true);
                      setIsDuplicatePanelOpen(false);
                    }}
                    className="px-1.5 sm:px-2 py-1 bg-[#63d079] hover:bg-[#4ec767] box-style-md 
                               text-xs uppercase hover:cursor-pointer">
                    <SearchIcon className="w-3 h-3 sm:w-4 sm:h-4 inline-block" />
                  </button>
                </div>
              </div>
              <div className="max-h-[40vh] sm:max-h-[50vh] min-h-[40vh] sm:min-h-[50vh] overflow-y-auto">
                {isLoadingSongs ? (
                  <div className="flex items-center justify-center h-[50vh]"><Spinner /></div>
                ) : isSongsError ? (
                  <div className="p-4 text-center italic text-red-600">
                    Failed to load songs.
                  </div>
                ) : songs.length === 0 ? (
                  <div className="p-4 text-center italic text-gray-500">
                    No songs in this playlist.
                  </div>
                ) : (
                  <table className="w-full min-w-[280px] border-collapse text-xs sm:text-sm">
                    <thead className="bg-[#ffe9c2] border-b-4 border-black sticky top-0 z-10">
                      <tr className="h-[32px] sm:h-[36px]">
                        <th className="px-1 sm:px-2 text-left w-8 sm:w-10 text-[10px] sm:text-xs">#</th>
                        <th className="px-1 sm:px-2 text-left uppercase text-[10px] sm:text-xs">Title</th>
                        <th className="px-1 sm:px-2 text-left uppercase text-[10px] sm:text-xs">Artist</th>
                        <th className="hidden md:table-cell px-2 text-left uppercase w-16 text-xs">Duration</th>
                        <th className="px-1 sm:px-2 text-center uppercase w-12 sm:w-20 text-[10px] sm:text-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {songs.map((song, i) => {
                        return (
                          <tr
                            key={song.id + i}
                            className={`${i % 2 === 0 ? "bg-[#fffaf0]" : "bg-[#fff3e6]"}
                                       ${isScanning && song.id === currentTrack?.id ? accentSoft : ""}
                                       ${duplicateIds.has(song.id) ? "bg-red-400" : ""}
                                       hover:bg-[#ffe9c2]` }>
                            <td className="px-1 sm:px-2 py-1 text-[10px] sm:text-xs">{i + 1}</td>
                            <td
                              className="px-1 sm:px-2 py-1 max-w-[15ch] sm:max-w-[20ch] truncate text-[10px] sm:text-xs"
                              title={song.title}>{song.title || "Untitled"}</td>
                            <td
                              className="px-1 sm:px-2 py-1 max-w-[15ch] sm:max-w-[20ch] truncate text-[10px] sm:text-xs"
                              title={song.artist}>{song.artist || "Unknown"}</td>
                            <td className="hidden md:table-cell px-2 py-1 text-center text-xs">
                              {formatDuration(song.durationMs)}
                            </td>
                            <td className="px-1 sm:px-2 py-1 text-center">
                              <button
                                onClick={() => onRemoveSong(playlist, song)}
                                className="p-0.5 sm:p-1 bg-[#f26b6b] hover:bg-[#e55d5d] box-style-md hover:cursor-pointer">
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        <SongSearchPanel
          currentPlaylist={playlist}
          accentSoft={accentSoft}
          accentText={accentText}
          open={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectSong={(track) => onAddSong(playlist, track)}
        />

        <DuplicateSearchPanel
          open={isDuplicatePanelOpen}
          onClose={() => setIsDuplicatePanelOpen(false)}
          currentPlaylist={playlist}
          accentSoft={accentSoft}
          accentText={accentText}
          isScanning={isScanning}
          onStartScan={onStartScan!}
          onCancelScan={onCancelScan!}
          duplicates={duplicateTracks || []}
          onDeleteSelected={(tracks) => {
            tracks.forEach(t => onRemoveSong(playlist, t));
            if (setDuplicateTracks) {
              setDuplicateTracks([]);
            }
          }}
        />
      </div>
    </div>
  );
}
