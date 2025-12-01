import React, { useState } from "react";
import { usePlaylistData } from "../../hooks/playlists/usePlaylistData.tsx";
import { usePlaylistSongsManagement } from "../../hooks/playlists/usePlaylistSongsManagement.tsx";
import { getProviderColors, getProviderName } from "../../utils/providerUtils.tsx";
import Window from "../../components/ui/Window.tsx";
import LoadingWindow from "../../components/ui/Window/LoadingWindow.tsx";
import PlaylistDetailsModal from "../../components/playlists/PlaylistDetailsModal.tsx";
import { usePlaylistSelection } from "../../hooks/playlists/usePlaylistSelection.tsx";
import PlaylistActions from "../../components/playlists/PlaylistActionts.tsx";
import { deletePlaylist } from "../../services/PlaylistsService.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import ConfirmWindow from "../../components/ui/Window/ConfirmWindow.tsx";
import { PaginationControls } from "../../components/playlists/PaginationControls.tsx";
import { PlaylistTable } from "../../components/playlists/PlaylistTable.tsx";

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
    handleToggleSelect
  } = usePlaylistSelection();

  const {
    focusedPlaylist,
    setFocusedPlaylist,
    handleAddSong,
    handleRemoveSong,
    getSongsForPlaylist,
    isLoadingTracks,
    isTracksError,
  } = usePlaylistSongsManagement();

  const [playlistToDelete, setPlaylistToDelete] = useState<ProviderPlaylist | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 11;
  const totalPages = Math.ceil(effectivePlaylists.length / pageSize);
  const visiblePlaylists = effectivePlaylists.slice((page - 1) * pageSize, page * pageSize);

  const handleCloseModal = () => setFocusedPlaylist(null);

  const providerColors = focusedPlaylist
    ? getProviderColors(getProviderName(focusedPlaylist.provider))
    : {
      accent: "bg-gray-400",
      accentSoft: "bg-gray-200",
      text: "text-black",
    };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center font-mono">
        <LoadingWindow
          loadingSpeed={ 200 }
          status="loading"
          loadingMessage="Loading playlists..."
        />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 font-mono flex flex-col text-black h-full w-full overflow-hidden">
        <PlaylistActions
          selectedIds={ selectedIds }
          hasSelection={ hasSelection }
          isFetching={ isFetching }
          playlists={ playlists }
          refetchPlaylists={ refetch }
        />

        <Window
          containerClassName="w-full h-full box-style-md overflow-hidden bg-[#fff5df]"
          ribbonClassName="bg-[#f38ca7] border-b-4 border-black text-white font-extrabold"
          windowClassName="bg-[#fff9ec]"
          ribbonContent={
            <div className="flex items-center justify-between w-full px-4 py-1">
              <h2 className="text-lg text-black uppercase tracking-wider">
                Your Playlists ({ effectivePlaylists.length })
              </h2>
            </div>
          }>
          { effectivePlaylists.length === 0 ? (
            <div className="flex items-center justify-center h-64 italic text-gray-700 text-lg">
              No playlists found.
            </div>
          ) : (
            <div className="flex flex-col h-full p-3 pt-2 overflow-hidden">
              <input
                className="w-full box-style-md bg-[#fffaf5] text-black px-2 py-1.5 text-sm mb-2
                           placeholder-gray-500 focus:outline-none"
                placeholder="Search by playlist, provider, or tracks…"
                onChange={ () => {
                } }/>
              <PlaylistTable
                playlists={ playlists }
                visiblePlaylists={ visiblePlaylists }
                selectedIds={ selectedIds }
                handleToggleSelect={ handleToggleSelect }
                handleOpenModal={ setFocusedPlaylist }
                handleDelete={ setPlaylistToDelete }
                handleFindDuplicates={ () => {
                } }
                getPlaylistMeta={ getPlaylistMeta }
              />

              <PaginationControls
                page={ page }
                totalPages={ totalPages }
                onPageChange={ setPage }/>
            </div>
          ) }
        </Window>
      </div>

      { focusedPlaylist && (
        <PlaylistDetailsModal
          playlist={ focusedPlaylist }
          onClose={ handleCloseModal }
          getSongsForPlaylist={ getSongsForPlaylist }
          onAddSong={ handleAddSong }
          onRemoveSong={ handleRemoveSong }
          accentSoft={ providerColors.accentSoft }
          accentText={ providerColors.text }
          isLoadingSongs={ isLoadingTracks }
          isSongsError={ isTracksError }
        />
      ) }

      { playlistToDelete && (
        <ConfirmWindow
          height="200px"
          confirmTitle="Delete Playlist?"
          confirmMessage={ `Are you sure you want to delete ${ getProviderName(playlistToDelete.provider) } playlist "${ playlistToDelete.title }"?` }
          onCancel={ () => setPlaylistToDelete(null) }
          onConfirm={ async () => {
            try {
              await deletePlaylist(
                getProviderName(playlistToDelete.provider),
                playlistToDelete.id,
                playlistToDelete.providerId
              );
              await refetch();
            } catch (err) {
              console.error(err);
              alert("Failed to delete playlist.");
            } finally {
              setPlaylistToDelete(null);
            }
          } }
        />
      ) }
    </>
  );
}
