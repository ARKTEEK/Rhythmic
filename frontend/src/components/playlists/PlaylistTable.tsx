import {
  Cloud,
  Disc3,
  ExternalLink,
  History,
  Link,
  List,
  Music,
  Scissors,
  Server,
  SortDesc,
  ToolCase,
  Trash2
} from "lucide-react";
import { PlaylistMeta } from "../../hooks/playlists/usePlaylistData.tsx";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { getProviderName } from "../../utils/providerUtils.tsx";
import PlatformIcon from "../ui/Icon/PlatformIcon.tsx";

interface PlaylistTableProps {
  playlists: ProviderPlaylist[];
  visiblePlaylists: ProviderPlaylist[];
  selectedIds: Set<string>;
  handleToggleSelect: (id: string) => void;
  handleOpenModal: (playlist: ProviderPlaylist) => void;
  handleDelete: (playlist: ProviderPlaylist) => void;
  handleFindDuplicates: (playlist: ProviderPlaylist) => void;
  handleTransfer: (playlist: ProviderPlaylist) => void;
  handleHistory: (playlist: ProviderPlaylist) => void;
  handleSplit: (playlist: ProviderPlaylist) => void;
  getPlaylistMeta: (id: string, fallbackCount: number) => PlaylistMeta;
}

export function PlaylistTable({
  playlists,
  visiblePlaylists,
  selectedIds,
  handleToggleSelect,
  handleOpenModal,
  handleDelete,
  handleFindDuplicates,
  handleTransfer,
  handleHistory,
  handleSplit,
  getPlaylistMeta,
}: PlaylistTableProps) {

  return (
    <div className="flex-1 overflow-y-auto box-style-md rounded-lg">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <colgroup>
          <col className="w-[3rem]" />
          <col className="w-[45%]" />
          <col className="w-[10%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
          <col className="w-[12%]" />
        </colgroup>

        <thead className="bg-[#f3d99c] border-b-4 border-black sticky top-0 z-10">
          <tr className="h-[48px]">
            <th className="px-2 text-center"></th>

            <th className="px-2 text-left font-extrabold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <Disc3 className="w-4 h-4 text-[#f38ca7]" />
                Playlist
                <SortDesc className="w-3 h-3 text-xs opacity-70" />
              </div>
            </th>

            <th className="px-2 text-center font-extrabold uppercase tracking-wider">
              <div className="flex items-center justify-center gap-1">
                <List className="w-4 h-4 text-[#5cb973]" />
                Tracks
                <SortDesc className="w-3 h-3 text-xs opacity-70" />
              </div>
            </th>

            <th className="px-2 text-center font-extrabold uppercase tracking-wider">
              <div className="flex items-center justify-center gap-1">
                <Cloud className="w-4 h-4 text-[#40a8d0]" />
                Provider
                <SortDesc className="w-3 h-3 text-xs opacity-70" />
              </div>
            </th>

            <th className="px-2 text-left font-extrabold uppercase tracking-wider">
              <div className="flex items-center justify-center gap-1">
                <Link className="w-4 h-4 text-[#9b88c7]" />
                Linked
                <SortDesc className="w-3 h-3 text-xs opacity-70" />
              </div>
            </th>

            <th className="px-2 text-center font-extrabold uppercase tracking-wider">
              <div className="flex items-center justify-center gap-1">
                <ToolCase className="w-4 h-4 text-[#d46a5d]" />
                Actions
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {visiblePlaylists.map((playlist, i) => {
            const meta = getPlaylistMeta(playlist.id, playlist.itemCount);
            const providerName = getProviderName(playlist.provider);
            const linkedTitle = playlists.find(
              p => p.id === playlist.linkedPlaylistId
            )?.title;
            const isSelected = selectedIds.has(playlist.id);

            return (
              <tr
                key={playlist.id}
                className={`
                        transition-all cursor-pointer h-[56px] hover:cursor-pointer
                        ${i % 2 === 0 ? "bg-[#fffaf0]" : "bg-[#fff3e6]"}
                        hover:bg-[#ffe9c2]
                        ${isSelected ? "bg-[#ffe9c2]" : ""}`}>
                <td className="text-center align-middle">
                  <input
                    type="checkbox"
                    className="accent-[#f38ca7] w-4 h-4"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(playlist.id)}
                    onClick={e => e.stopPropagation()}
                  />
                </td>

                <td
                  className="px-2 align-middle cursor-pointer"
                  onClick={() => {
                    handleOpenModal(playlist);
                  }}>
                  <div className="flex items-center gap-3">
                    {playlist.thumbnailUrl ? (
                      <img
                        src={playlist.thumbnailUrl}
                        alt={playlist.title}
                        className="w-10 h-10 border-2 border-black box-style-md"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#fffaf5] border-2 border-black flex items-center justify-center text-gray-500">
                        <Music className="w-4 h-4 text-sm" />
                      </div>
                    )}

                    <div className="min-w-0 max-w-[300px]">
                      <div className="font-bold truncate">{playlist.title}</div>
                      <div className="text-xs text-gray-700 truncate">
                        {playlist.description || "No description"}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-2 text-center font-semibold text-gray-800 align-middle">
                  {meta.trackCount}
                </td>

                <td className="px-2 text-center align-middle">
                  <div className="flex items-center justify-center">
                    <PlatformIcon
                      providerName={providerName}
                      label={providerName}
                    />
                  </div>
                </td>


                <td className="text-center text-xs text-gray-700 align-middle">
                  {linkedTitle || <span className="text-gray-500">N/A</span>}
                </td>

                <td className="px-2 text-center align-middle">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHistory(playlist);
                      }}
                      className="p-1 bg-[#63d079] hover:bg-[#4ec767] border-black box-style-md hover:cursor-pointer"
                      title="View History">
                      <History className="w-4 h-4 text-black" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSplit(playlist);
                      }}
                      className="p-1 bg-[#9b88c7] hover:bg-[#8a77b6] border-black box-style-md hover:cursor-pointer"
                      title="Split Playlist">
                      <Scissors className="w-4 h-4 text-black" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFindDuplicates(playlist);
                      }}
                      className="p-1 bg-[#ffb74a] hover:bg-[#ffa726] border-black box-style-md hover:cursor-pointer"
                      title="Find Duplicates">
                      <ExternalLink className="w-4 h-4 text-black" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTransfer(playlist);
                      }}
                      className="p-1 bg-[#40a8d0] hover:bg-[#2f97bf] border-black box-style-md hover:cursor-pointer"
                      title="Transfer Playlist">
                      <Server className="w-4 h-4 text-black" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(playlist);
                      }}
                      className="p-1 bg-[#f26b6b] hover:bg-[#e55d5d] border-black box-style-md hover:cursor-pointer"
                      title="Delete Playlist">
                      <Trash2 className="w-4 h-4 text-black" />
                    </button>
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
