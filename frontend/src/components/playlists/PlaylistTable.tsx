import {
  Cloud,
  Disc3,
  Link,
  List,
  Loader2,
  Music,
  SortDesc,
  ToolCase
} from "lucide-react";
import { PlaylistMeta } from "../../hooks/playlists/usePlaylistData.tsx";
import { PlaylistSyncGroup } from "../../models/PlaylistSync.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { getProviderName } from "../../utils/providerUtils.tsx";
import PlatformIcon from "../ui/Icon/PlatformIcon.tsx";
import PlaylistActionsDropdown from "./PlaylistActionsDropdown.tsx";

interface PlaylistTableProps {
  playlists: ProviderPlaylist[];
  visiblePlaylists: ProviderPlaylist[];
  syncGroups?: PlaylistSyncGroup[];
  syncingGroupIds?: Set<number>;
  handleOpenModal: (playlist: ProviderPlaylist) => void;
  handleDelete: (playlist: ProviderPlaylist) => void;
  handleFindDuplicates: (playlist: ProviderPlaylist) => void;
  handleTransfer: (playlist: ProviderPlaylist) => void;
  handleHistory: (playlist: ProviderPlaylist) => void;
  handleSplit: (playlist: ProviderPlaylist) => void;
  handleSync: (playlist: ProviderPlaylist) => void;
  handleConfigureSync?: (playlist: ProviderPlaylist) => void;
  isSyncing?: boolean;
  getPlaylistMeta: (id: string, fallbackCount: number) => PlaylistMeta;
}

export function PlaylistTable({
  playlists,
  visiblePlaylists,
  syncGroups = [],
  syncingGroupIds = new Set(),
  handleOpenModal,
  handleDelete,
  handleFindDuplicates,
  handleTransfer,
  handleHistory,
  handleSplit,
  handleSync,
  handleConfigureSync,
  isSyncing = false,
  getPlaylistMeta,
}: PlaylistTableProps) {

  const getSyncGroupInfo = (playlist: ProviderPlaylist) => {
    const masterGroup = syncGroups.find(
      sg => sg.masterPlaylistId === playlist.id &&
        sg.masterProvider === playlist.provider &&
        sg.masterProviderAccountId === playlist.providerId
    );

    if (masterGroup) {
      return { type: 'master' as const, group: masterGroup };
    }

    for (const group of syncGroups) {
      const childMatch = group.children.find(
        c => c.childPlaylistId === playlist.id &&
          c.provider === playlist.provider &&
          c.providerAccountId === playlist.providerId
      );
      if (childMatch) {
        return { type: 'child' as const, group };
      }
    }

    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto box-style-md rounded-lg">
      <table className="w-full min-w-[320px] border-separate border-spacing-0 text-xs sm:text-sm">
        <colgroup>
          <col className="w-[45%] sm:w-[40%] md:w-[35%] lg:w-[40%]" />
          <col className="hidden sm:table-column w-[10%]" />
          <col className="w-[25%] sm:w-[20%] md:w-[20%] lg:w-[15%]" />
          <col className="hidden lg:table-column w-[15%]" />
          <col className="w-[30%] sm:w-[30%] md:w-[25%] lg:w-[15%]" />
        </colgroup>

        <thead className="bg-[#f3d99c] border-b-4 border-black sticky top-0 z-10">
          <tr className="h-[40px] sm:h-[48px]">
            <th className="px-1 sm:px-2 text-left font-extrabold uppercase tracking-wider text-[10px] sm:text-xs">
              <div className="flex items-center gap-1">
                <Disc3 className="w-3 h-3 sm:w-4 sm:h-4 text-[#f38ca7]" />
                <span className="hidden sm:inline">Playlist</span>
                <span className="sm:hidden">List</span>
                <SortDesc className="w-2 h-2 sm:w-3 sm:h-3 text-xs opacity-70" />
              </div>
            </th>
            <th className="hidden sm:table-cell px-2 text-center font-extrabold uppercase tracking-wider text-xs">
              <div className="flex items-center justify-center gap-1">
                <List className="w-4 h-4 text-[#5cb973]" />
                <span>Tracks</span>
                <SortDesc className="w-3 h-3 text-xs opacity-70" />
              </div>
            </th>
            <th className="px-1 sm:px-2 text-center font-extrabold uppercase tracking-wider text-[10px] sm:text-xs">
              <div className="flex items-center justify-center gap-1">
                <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-[#40a8d0]" />
                <span className="hidden lg:inline">Provider</span>
                <SortDesc className="w-2 h-2 sm:w-3 sm:h-3 text-xs opacity-70" />
              </div>
            </th>
            <th className="hidden lg:table-cell px-2 text-left font-extrabold uppercase tracking-wider text-xs">
              <div className="flex items-center justify-center gap-1">
                <Link className="w-4 h-4 text-[#9b88c7]" />
                Linked
                <SortDesc className="w-3 h-3 text-xs opacity-70" />
              </div>
            </th>
            <th className="px-1 sm:px-2 text-center font-extrabold uppercase tracking-wider text-[10px] sm:text-xs">
              <div className="flex items-center justify-center gap-1">
                <ToolCase className="w-3 h-3 sm:w-4 sm:h-4 text-[#d46a5d]" />
                <span className="hidden sm:inline">Actions</span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {visiblePlaylists.map((playlist, i) => {
            const meta = getPlaylistMeta(playlist.id, playlist.itemCount);
            const providerName = getProviderName(playlist.provider);
            const linkedTitle = playlists.find(p => p.id === playlist.linkedPlaylistId)?.title;
            const syncInfo = getSyncGroupInfo(playlist);

            return (
              <tr
                key={playlist.id}
                className={`
                transition-all cursor-pointer h-[48px] sm:h-[56px]
                ${i % 2 === 0 ? "bg-[#fffaf0]" : "bg-[#fff3e6]"}
                hover:bg-[#ffe9c2]
              `}>
                <td
                  className="px-1 sm:px-2 align-middle cursor-pointer"
                  onClick={() => handleOpenModal(playlist)}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {playlist.thumbnailUrl ? (
                      <img
                        src={playlist.thumbnailUrl}
                        alt={playlist.title}
                        className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-black box-style-md"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#fffaf5] border-2 border-black
                                      flex items-center justify-center text-gray-500">
                        <Music className="w-3 h-3 sm:w-4 sm:h-4 text-sm" />
                      </div>
                    )}

                    <div className="min-w-0 max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                      <div className="font-bold truncate text-xs sm:text-sm">{playlist.title}</div>
                      <div className="hidden sm:block text-xs text-gray-700 truncate">
                        {playlist.description || "No description"}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="hidden sm:table-cell px-2 text-center font-semibold text-gray-800 align-middle text-sm">
                  {meta.trackCount}
                </td>

                <td className="px-1 sm:px-2 text-center align-middle">
                  <div className="flex items-center justify-center">
                    <PlatformIcon
                      providerName={providerName}
                      label={providerName}
                    />
                  </div>
                </td>

                <td className="hidden lg:table-cell text-center text-xs text-gray-700 align-middle px-2">
                  {syncInfo ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-[#9b88c7]">{syncInfo.group.name}</span>
                      {syncingGroupIds.has(syncInfo.group.id) && (
                        <Loader2 className="w-4 h-4 animate-spin text-[#40a8d0]" />
                      )}
                      {!syncInfo.group.syncEnabled && (
                        <span className="text-[10px] text-red-500 font-bold">(Disabled)</span>
                      )}
                    </div>
                  ) : linkedTitle ? (
                    linkedTitle
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </td>

                <td className="px-1 sm:px-2 text-center align-middle">
                  <div className="flex justify-center">
                    <PlaylistActionsDropdown
                      playlist={playlist}
                      onSync={() => handleSync(playlist)}
                      onHistory={() => handleHistory(playlist)}
                      onSplit={() => handleSplit(playlist)}
                      onTransfer={() => handleTransfer(playlist)}
                      onConfigureSync={() => handleConfigureSync?.(playlist)}
                      onDelete={() => handleDelete(playlist)}
                      isSyncing={isSyncing}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}
