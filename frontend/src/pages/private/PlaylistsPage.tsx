import React from "react";
import Window from "../../components/ui/Window.tsx";
import LoadingWindow from "../../components/ui/Window/LoadingWindow.tsx";
import { usePlaylistData } from "../../hooks/playlists/usePlaylistData.tsx";
import { usePlaylistSelection } from "../../hooks/playlists/usePlaylistSelection.tsx";
import { usePlaylistSongsManagement } from "../../hooks/playlists/usePlaylistSongsManagement.tsx";
import PlaylistListItem from "../../components/playlists/PlaylistListItem.tsx";
import PlaylistDetails from "../../components/playlists/PlaylistDetails.tsx";
import PlaylistActions from "../../components/playlists/PlaylistActionts.tsx";
import { ArrowDownAZ, X } from "lucide-react";

export default function PlaylistsPage() {
  const {
    isLoading,
    playlists,
    effectivePlaylists,
    refetch,
    isFetching,
    getPlaylistMeta,
  } = usePlaylistData();

  const {
    selectedIds,
    hasSelection,
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,
  } = usePlaylistSelection();

  const {
    focusedPlaylistId,
    setFocusedPlaylistId,
    handleAddSong,
    handleRemoveSong,
    getSongsForPlaylist,
    isLoadingTracks,
    isTracksError
  } = usePlaylistSongsManagement(effectivePlaylists);

  const handleListItemClick = (e: React.MouseEvent<HTMLButtonElement>, playlistId: string) => {
    if (e.ctrlKey || e.metaKey) {
      handleToggleSelect(playlistId);
    } else {
      setFocusedPlaylistId(playlistId);
    }
  };

  if (isLoading) {
    return (
      <LoadingWindow
        loadingSpeed={ 200 }
        status="loading"
        loadingMessage="Loading playlists..."
      />
    );
  }

  const ribbonPalette = ["bg-blue-200", "bg-green-200", "bg-purple-200", "bg-pink-200", "bg-yellow-200", "bg-cyan-200"];
  const windowPalette = ["bg-blue-50", "bg-green-50", "bg-purple-50", "bg-pink-50", "bg-yellow-50", "bg-cyan-50"];

  return (
    <div className="w-full flex justify-center m-4">
      <PlaylistActions
        selectedIds={ selectedIds }
        hasSelection={ hasSelection }
        isFetching={ isFetching }
        playlists={ playlists }
        refetchPlaylists={ refetch }
      />

      <Window
        containerClassName="w-full"
        ribbonClassName="bg-purple-200"
        windowClassName="bg-stone-100"
        ribbonContent={ (
          <div className="w-full flex items-center justify-between px-2">
            <div className="text-brown-900 font-black tracking-wide font-mono uppercase">
              Your Playlists
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={ () => handleSelectAll(effectivePlaylists) }
                className="box-style-sm p-1 text-[11px] font-semibold border border-brown-800
                           bg-white text-brown-900 hover:bg-brown-100 transition uppercase">
                <ArrowDownAZ className="w-[20px] h-[20px]"/>
              </button>
              <button
                onClick={ handleClearSelection }
                className="box-style-sm p-1 text-[11px] font-semibold border border-brown-800
                           bg-white text-brown-900 hover:bg-brown-100 transition uppercase">
                <X className="w-[20px] h-[20px]"/>
              </button>
            </div>
          </div>
        ) }>
        { effectivePlaylists.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-gray-600 italic">
            No playlists found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 p-4">
            <div className="flex flex-col gap-4 h-full">
              <div className="box-style-md bg-white p-3 h-full">
                <input
                  className="w-full box-style-sm bg-white text-black px-3 py-2 text-sm outline-none mb-3"
                  placeholder="Search playlists..."
                  onChange={ () => {
                  } }
                />

                <div className="max-h-[66vh] overflow-y-auto pr-2 retro-scrollbar">
                  <ul className="space-y-2">
                    { effectivePlaylists.map((playlist, idx) => (
                      <PlaylistListItem
                        key={ playlist.id }
                        playlist={ playlist }
                        idx={ idx }
                        isSelected={ selectedIds.has(playlist.id) }
                        onToggleSelect={ handleToggleSelect }
                        onListItemClick={ handleListItemClick }
                        getPlaylistMeta={ getPlaylistMeta }
                      />
                    )) }
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              { focusedPlaylistId ? (() => {
                const playlist = effectivePlaylists.find(p => p.id === focusedPlaylistId)!;
                const idx = effectivePlaylists.findIndex(p => p.id === playlist.id);
                const accent = ribbonPalette[idx % ribbonPalette.length];
                const accentSoft = windowPalette[idx % windowPalette.length];
                return (
                  <PlaylistDetails
                    playlist={ playlist }
                    getPlaylistMeta={ getPlaylistMeta }
                    getSongsForPlaylist={ getSongsForPlaylist }
                    onAddSong={ handleAddSong }
                    onRemoveSong={ handleRemoveSong }
                    accent={ accent }
                    accentSoft={ accentSoft }
                    isLoadingSongs={ isLoadingTracks }
                    isSongsError={ isTracksError }
                  />
                );
              })() : (
                <div
                  className="box-style-lg bg-white p-8 text-center text-brown-900">
                  Select a playlist to view songs
                </div>
              ) }
            </div>
          </div>
        ) }
      </Window>
    </div>
  );
}
