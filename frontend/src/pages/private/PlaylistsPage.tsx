import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CreatePlaylistModal from "../../components/playlists/CreatePlaylistModal.tsx";
import { PaginationControls } from "../../components/playlists/PaginationControls.tsx";
import PlaylistActions from "../../components/playlists/PlaylistActionts.tsx";
import PlaylistDetailsModal from "../../components/playlists/PlaylistDetailsModal.tsx";
import PlaylistHistoryModal from "../../components/playlists/PlaylistHistoryModal.tsx";
import PlaylistSplitModal from "../../components/playlists/PlaylistSplitModal.tsx";
import PlaylistSyncManagementModal from "../../components/playlists/PlaylistSyncManagementModal.tsx";
import PlaylistSyncModal from "../../components/playlists/PlaylistSyncModal.tsx";
import { PlaylistTable } from "../../components/playlists/PlaylistTable.tsx";
import { PlaylistTransferModal } from "../../components/playlists/PlaylistTransferModal.tsx";
import Window from "../../components/ui/Window.tsx";
import ConfirmWindow from "../../components/ui/Window/ConfirmWindow.tsx";
import LoadingWindow from "../../components/ui/Window/LoadingWindow.tsx";
import { JobType } from "../../enums/JobType.ts";
import { usePlaylistData } from "../../hooks/playlists/usePlaylistData.tsx";
import { usePlaylistFilter } from "../../hooks/playlists/usePlaylistFilter.tsx";
import { usePlaylistSelection } from "../../hooks/playlists/usePlaylistSelection.tsx";
import { usePlaylistSongsManagement } from "../../hooks/playlists/usePlaylistSongsManagement.tsx";
import { usePlaylistSync } from "../../hooks/playlists/usePlaylistSync.tsx";
import { useSignalR } from "../../hooks/useSignalR.tsx";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { ProviderTrack } from "../../models/ProviderTrack.ts";
import createConnectionsQueryOptions from "../../queries/createConnectionsQueryOptions.ts";
import { deletePlaylist } from "../../services/PlaylistsService.ts";
import { getProviderColors, getProviderName, OAuthProviderNames, platforms } from "../../utils/providerUtils.tsx";

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
    searchQuery,
    setSearchQuery,
    filteredPlaylists,
  } = usePlaylistFilter(effectivePlaylists);

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

  const {
    startJob,
    cancelJob,
    isRunning,
    activeJobType,
    processedTracksMap,
    setProcessedTracksMap,
    currentTrack
  } = useSignalR();

  const { handleSync, isSyncing, syncingGroups } = usePlaylistSync();

  const { data: syncGroups = [] } = useQuery({
    queryKey: ["sync-groups"],
    queryFn: async () => {
      const { getSyncGroups } = await import("../../services/PlaylistSyncService.ts");
      return getSyncGroups();
    },
  });

  const [playlistToDelete, setPlaylistToDelete] = useState<ProviderPlaylist | null>(null);
  const [transferPlaylist, setTransferPlaylist] = useState<ProviderPlaylist | null>(null);
  const [historyPlaylist, setHistoryPlaylist] = useState<ProviderPlaylist | null>(null);
  const [splitPlaylist, setSplitPlaylist] = useState<ProviderPlaylist | null>(null);
  const [syncModalPlaylist, setSyncModalPlaylist] = useState<ProviderPlaylist | null>(null);
  const [manageSyncPlaylist, setManageSyncPlaylist] = useState<ProviderPlaylist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: connections = [] } = useQuery(createConnectionsQueryOptions());

  const [page, setPage] = useState(1);
  const pageSize = 11;
  const totalPages = Math.ceil(filteredPlaylists.length / pageSize);
  const visiblePlaylists = filteredPlaylists.slice((page - 1) * pageSize, page * pageSize);

  const platformsWithAccounts = platforms.map(platform => {
    const matchedConnections = connections
      .filter(conn => OAuthProviderNames[conn.provider] === platform.name)
      .map(conn => ({
        id: conn.id,
        username: conn.displayname,
        email: conn.email,
      }));

    return {
      ...platform,
      accounts: matchedConnections,
    };
  });

  const handleCloseModal = () => {
    setFocusedPlaylist(null);
    // Clear duplicate tracks when closing modal
    if (activeJobType === JobType.FindDuplicateTracks) {
      setProcessedTracksMap(prev => ({
        ...prev,
        [JobType.FindDuplicateTracks]: []
      }));
    }
  };

  const handleTransfer = (playlist: ProviderPlaylist) => {
    setTransferPlaylist(playlist);
  };

  const handleSplit = (playlist: ProviderPlaylist) => {
    setSplitPlaylist(playlist);
  };

  const handleConfigureSync = (playlist: ProviderPlaylist) => {
    const existingGroup = syncGroups.find(
      (sg) =>
        (sg.masterPlaylistId === playlist.id &&
          sg.masterProvider === playlist.provider &&
          sg.masterProviderAccountId === playlist.providerId) ||
        sg.children.some(
          (c) =>
            c.childPlaylistId === playlist.id &&
            c.provider === playlist.provider &&
            c.providerAccountId === playlist.providerId
        )
    );

    if (existingGroup) {
      setManageSyncPlaylist(playlist);
    } else {
      setSyncModalPlaylist(playlist);
    }
  };

  const handleFindDuplicates = async (playlist: ProviderPlaylist) => {
    startJob(JobType.FindDuplicateTracks, {
      provider: playlist.provider,
      providerAccountId: playlist.providerId,
      playlistId: playlist.id,
    });
  };

  const handleCancelJob = async () => {
    cancelJob();
  };

  const providerColors = focusedPlaylist
    ? getProviderColors(getProviderName(focusedPlaylist.provider))
    : {
      accent: "bg-gray-400",
      accentSoft: "bg-gray-200",
      text: "text-black",
    };

  const historyProviderColors = historyPlaylist
    ? getProviderColors(getProviderName(historyPlaylist.provider))
    : {
      accent: "bg-gray-400",
      accentSoft: "bg-gray-200",
      text: "text-black",
    };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center font-mono">
        <LoadingWindow
          loadingSpeed={200}
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
          selectedIds={selectedIds}
          hasSelection={hasSelection}
          isFetching={isFetching}
          playlists={playlists}
          refetchPlaylists={refetch}
          onCreatePlaylist={() => setShowCreateModal(true)}
        />

        <Window
          containerClassName="w-full h-full box-style-md overflow-hidden bg-[#fff5df]"
          ribbonClassName="bg-[#f38ca7] border-b-4 border-black text-white font-extrabold"
          windowClassName="bg-[#fff9ec]"
          ribbonContent={
            <div className="flex items-center justify-between w-full px-4 py-1">
              <h2 className="text-lg text-black uppercase tracking-wider">
                Your Playlists ({filteredPlaylists.length}{filteredPlaylists.length !== effectivePlaylists.length ? `/${effectivePlaylists.length}` : ""})
              </h2>
            </div>
          }>
          {effectivePlaylists.length === 0 ? (
            <div className="flex items-center text-center justify-center h-64 text-gray-700 text-lg">
              No playlists found or no accounts connected. <br /> Please make sure you have connected your accounts in the Connections page.
            </div>
          ) : (
            <div className="flex flex-col h-full p-3 pt-2 overflow-hidden">
              <div className="mb-2">
                <input
                  className="w-full box-style-md bg-[#fffaf5] text-black px-3 py-2 text-sm
                             placeholder-gray-500 focus:outline-none border-2 border-black"
                  placeholder='Search: "title & tracks > 10 & provider = spotify"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && (
                  <p className="text-xs text-gray-600 mt-1 px-1">
                    Syntax: "title" & "tracks {'>'} {'<'} = number" & "provider = spotify/google/soundcloud/tidal"
                  </p>
                )}
              </div>
              <PlaylistTable
                playlists={playlists}
                visiblePlaylists={visiblePlaylists}
                selectedIds={selectedIds}
                syncGroups={syncGroups}
                syncingGroupIds={syncingGroups}
                handleToggleSelect={handleToggleSelect}
                handleOpenModal={setFocusedPlaylist}
                handleDelete={setPlaylistToDelete}
                handleFindDuplicates={handleFindDuplicates}
                handleTransfer={handleTransfer}
                handleHistory={setHistoryPlaylist}
                handleSplit={handleSplit}
                handleConfigureSync={handleConfigureSync}
                handleSync={handleSync}
                isSyncing={isSyncing}
                getPlaylistMeta={getPlaylistMeta}
              />

              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={setPage} />
            </div>
          )}
        </Window>
      </div>

      {focusedPlaylist && (
        <PlaylistDetailsModal
          playlist={focusedPlaylist}
          onClose={handleCloseModal}
          getSongsForPlaylist={getSongsForPlaylist}
          onAddSong={handleAddSong}
          onRemoveSong={handleRemoveSong}
          accentSoft={providerColors.accentSoft}
          accentText={providerColors.text}
          isLoadingSongs={isLoadingTracks}
          isSongsError={isTracksError}
          isScanning={isRunning}
          currentTrack={currentTrack!}
          duplicateTracks={processedTracksMap[JobType.FindDuplicateTracks]}
          setDuplicateTracks={(tracks: ProviderTrack[]) => {
            if (!activeJobType) return;
            setProcessedTracksMap(prev => ({
              ...prev,
              [activeJobType]: tracks
            }));
          }}
          onStartScan={() => handleFindDuplicates(focusedPlaylist)}
          onCancelScan={() => handleCancelJob()}
        />
      )}

      {playlistToDelete && (
        <ConfirmWindow
          height="200px"
          confirmTitle="Delete Playlist?"
          confirmMessage={`Are you sure you want to delete ${getProviderName(playlistToDelete.provider)} playlist "${playlistToDelete.title}"?`}
          onCancel={() => setPlaylistToDelete(null)}
          onConfirm={async () => {
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
          }}
        />
      )}

      {transferPlaylist && (
        <PlaylistTransferModal
          playlist={transferPlaylist}
          platforms={platformsWithAccounts}
          onClose={() => setTransferPlaylist(null)}
        />
      )}

      {historyPlaylist && (
        <PlaylistHistoryModal
          playlist={historyPlaylist}
          onClose={() => setHistoryPlaylist(null)}
          accentSoft={historyProviderColors.accentSoft}
          accentText={historyProviderColors.text}
          onRevert={() => {
            refetch();
            setHistoryPlaylist(null);
          }}
        />
      )}

      {splitPlaylist && (
        <PlaylistSplitModal
          playlist={splitPlaylist}
          onClose={() => setSplitPlaylist(null)}
          accentSoft={getProviderColors(getProviderName(splitPlaylist.provider)).accentSoft}
          accentText={getProviderColors(getProviderName(splitPlaylist.provider)).text}
          onSplitSuccess={() => {
            refetch();
            setSplitPlaylist(null);
          }}
        />
      )}

      {syncModalPlaylist && (
        <PlaylistSyncModal
          playlist={syncModalPlaylist}
          availablePlaylists={effectivePlaylists}
          onClose={() => setSyncModalPlaylist(null)}
          onCreate={() => {
            refetch();
            setSyncModalPlaylist(null);
          }}
        />
      )}

      {manageSyncPlaylist && (
        <PlaylistSyncManagementModal
          playlist={manageSyncPlaylist}
          allPlaylists={effectivePlaylists}
          onClose={() => setManageSyncPlaylist(null)}
          accentSoft={getProviderColors(getProviderName(manageSyncPlaylist.provider)).accentSoft}
          accentText={getProviderColors(getProviderName(manageSyncPlaylist.provider)).text}
        />
      )}

      {showCreateModal && (
        <CreatePlaylistModal
          platforms={platformsWithAccounts}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
