import React, { useMemo, useState } from "react";
import { usePlaylistData } from "../../hooks/playlists/usePlaylistData.tsx";
import { usePlaylistSongsManagement } from "../../hooks/playlists/usePlaylistSongsManagement.tsx";
import { getProviderColors, getProviderName } from "../../utils/providerUtils.tsx";
import Window from "../../components/ui/Window.tsx";
import LoadingWindow from "../../components/ui/Window/LoadingWindow.tsx";
import PlaylistDetailsModal from "../../components/playlists/PlaylistDetailsModal.tsx";
import { FaCloud, FaCompactDisc, FaLink, FaListOl, FaMusic, FaSort, FaTools } from "react-icons/fa";
import { CopyX, Trash2 } from "lucide-react";
import { usePlaylistSelection } from "../../hooks/playlists/usePlaylistSelection.tsx";
import PlaylistActions from "../../components/playlists/PlaylistActionts.tsx";
import { deletePlaylist } from "../../services/PlaylistsService.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import ConfirmWindow from "../../components/ui/Window/ConfirmWindow.tsx";

export default function PlaylistsPage() {
  const {
    isLoading,
    playlists,
    effectivePlaylists,
    refetch,
    isFetching,
    getPlaylistMeta,
  } = usePlaylistData();
  const { selectedIds, hasSelection, handleToggleSelect } = usePlaylistSelection();
  const {
    focusedPlaylistId,
    setFocusedPlaylistId,
    handleAddSong,
    handleRemoveSong,
    getSongsForPlaylist,
    isLoadingTracks,
    isTracksError,
  } = usePlaylistSongsManagement(effectivePlaylists);

  const [playlistToDelete, setPlaylistToDelete] = useState<ProviderPlaylist | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(effectivePlaylists.length / pageSize);
  const visiblePlaylists = effectivePlaylists.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenModal = (playlistId: string) => setFocusedPlaylistId(playlistId);
  const handleCloseModal = () => setFocusedPlaylistId(null);

  const handleDelete = (e: React.MouseEvent, playlist: ProviderPlaylist) => {
    e.stopPropagation();
    setPlaylistToDelete(playlist);
  };

  const handleFindDuplicates = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    console.log("Find duplicates in:", id);
  };

  const focusedPlaylist = useMemo(
    () => effectivePlaylists.find((p) => p.id === focusedPlaylistId),
    [focusedPlaylistId, effectivePlaylists]
  );

  const providerColors = focusedPlaylist
    ? getProviderColors(getProviderName(focusedPlaylist.provider))
    : {
      accent: "bg-gray-400",
      accentSoft: "bg-gray-200",
      text: "text-black",
    };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center font-mono bg-[#faf2e0]">
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

              <div className="flex-1 overflow-y-auto box-style-md rounded-lg">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <colgroup>
                    <col className="w-[3rem]"/>
                    <col className="w-[45%]"/>
                    <col className="w-[10%]"/>
                    <col className="w-[15%]"/>
                    <col className="w-[15%]"/>
                    <col className="w-[12%]"/>
                  </colgroup>

                  <thead className="bg-[#f3d99c] border-b-4 border-black sticky top-0 z-10">
                  <tr className="h-[48px]">
                    <th className="px-2 text-center"></th>

                    <th className="px-2 text-left font-extrabold uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FaCompactDisc className="text-[#f38ca7]"/>
                        Playlist
                        <FaSort className="text-xs opacity-70 ml-1"/>
                      </div>
                    </th>

                    <th className="px-2 text-center font-extrabold uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <FaListOl className="text-[#5cb973]"/>
                        Tracks
                        <FaSort className="text-xs opacity-70 ml-1"/>
                      </div>
                    </th>

                    <th className="px-2 text-center font-extrabold uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <FaCloud className="text-[#40a8d0]"/>
                        Provider
                        <FaSort className="text-xs opacity-70 ml-1"/>
                      </div>
                    </th>

                    <th className="px-2 text-left font-extrabold uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FaLink className="text-[#9b88c7]"/>
                        Linked
                        <FaSort className="text-xs opacity-70 ml-1"/>
                      </div>
                    </th>

                    <th className="px-2 text-center font-extrabold uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <FaTools className="text-[#d46a5d]"/>
                        Actions
                      </div>
                    </th>
                  </tr>
                  </thead>

                  <tbody>
                  { visiblePlaylists.map((playlist, i) => {
                    const meta = getPlaylistMeta(playlist.id, playlist.itemCount);
                    const providerName = getProviderName(playlist.provider);
                    const linkedTitle = playlists.find(
                      p => p.id === playlist.linkedPlaylistId
                    )?.title;
                    const isSelected = selectedIds.has(playlist.id);

                    return (
                      <tr
                        key={ playlist.id }
                        className={ `
                        transition-all cursor-pointer h-[56px]
                        ${ i % 2 === 0 ? "bg-[#fffaf0]" : "bg-[#fff3e6]" }
                        hover:bg-[#ffe9c2]
                        ${ isSelected ? "outline outline-blue-400" : "" }` }>
                        <td className="text-center align-middle">
                          <input
                            type="checkbox"
                            className="accent-[#f38ca7] w-4 h-4"
                            checked={ isSelected }
                            onChange={ () => handleToggleSelect(playlist.id) }
                            onClick={ e => e.stopPropagation() }
                          />
                        </td>

                        <td
                          className="px-2 align-middle cursor-pointer"
                          onClick={ () => handleOpenModal(playlist.id) }>
                          <div className="flex items-center gap-3">
                            { playlist.thumbnailUrl ? (
                              <img
                                src={ playlist.thumbnailUrl }
                                alt={ playlist.title }
                                className="w-10 h-10 border-2 border-black box-style-md"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-[#fffaf5] border-2 border-black flex items-center justify-center text-gray-500">
                                <FaMusic className="text-sm"/>
                              </div>
                            ) }

                            <div className="min-w-0 max-w-[300px]">
                              <div className="font-bold truncate">{ playlist.title }</div>
                              <div className="text-xs text-gray-700 truncate">
                                { playlist.description || "No description" }
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 text-center font-semibold text-gray-800 align-middle">
                          { meta.trackCount }
                        </td>

                        <td className="px-2 text-center align-middle">
                          <span className={ `px-2 py-0.5 ${ getProviderColors(providerName).accent } text-black font-bold box-style-sm` }>
                            { providerName === "Google" ? "YouTube" : providerName }
                          </span>
                        </td>

                        <td className="px-2 text-left text-xs text-gray-700 align-middle truncate">
                          { linkedTitle || <span className="italic text-gray-500">N/A</span> }
                        </td>

                        <td className="px-2 text-center align-middle">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={ e => handleFindDuplicates(e, playlist.id) }
                              className="p-1 bg-[#ffb74a] hover:bg-[#ffa726] border-black box-style-md hover:cursor-pointer">
                              <CopyX className="w-4 h-4 text-black"/>
                            </button>

                            <button
                              onClick={ e => handleDelete(e, playlist) }
                              className="p-1 bg-[#f26b6b] hover:bg-[#e55d5d] border-black box-style-md hover:cursor-pointer">
                              <Trash2 className="w-4 h-4 text-black"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) }
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center items-center mt-2 gap-3 shrink-0">
                <button
                  disabled={ page === 1 }
                  onClick={ () => setPage(page - 1) }
                  className="px-3 py-1 bg-[#f38ca7] text-white box-style-sm hover:cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed">
                  Prev
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  Page { page } / { totalPages }
                </span>
                <button
                  disabled={ page === totalPages }
                  onClick={ () => setPage(page + 1) }
                  className="px-3 py-1 bg-[#f38ca7] text-white box-style-sm hover:cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
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
