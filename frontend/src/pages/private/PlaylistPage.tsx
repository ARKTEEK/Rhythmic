import { useMemo, useState } from "react";
import PlaylistGrid from "../../components/playlists/PlaylistGrid.tsx";
import PlaylistSortControls from "../../components/playlists/PlaylistSordControls.tsx";
import { Playlist } from "../../models/Playlist.ts";
import { useQuery } from "@tanstack/react-query";
import createPlaylistsQueryOptions from "../../queries/createPlaylistsQueryOptions.ts";

const PlaylistPage = () => {
  const { isLoading, isError, error, data: playlists } = useQuery(createPlaylistsQueryOptions());

  type SortKey = "title" | "itemCount" | "privacyStatus";
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortAsc, setSortAsc] = useState(true);

  const sortedPlaylists = useMemo(() => {
    if (!playlists) {
      return [];
    }

    const copy = [...playlists];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "itemCount":
          cmp = a.itemCount - b.itemCount;
          break;
        case "privacyStatus":
          cmp = a.privacyStatus.localeCompare(b.privacyStatus);
          break;
        case "title":
        default:
          cmp = a.title.localeCompare(b.title);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [playlists, sortKey, sortAsc]);

  const [activePl, setActivePl] = useState<Playlist | null>(null);

  const editPlaylist = (pl: Playlist) => {
    console.log("Edit", pl);
  };

  const deletePlaylist = (id: number) => {
    console.log("Delete", id);
  };

  if (isLoading) {
    return <div>Loading playlists...</div>;
  }

  if (isError) {
    return <div>{ (error as Error).message }</div>;
  }

  return (
    <div className="w-full mx-auto py-8 flex flex-col space-y-8 overflow-hidden">
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <h1 className="text-5xl font-extrabold text-red-400">Your Playlists</h1>
        <PlaylistSortControls
          sortKey={ sortKey }
          sortAsc={ sortAsc }
          setSortKey={ setSortKey }
          toggleSortOrder={ () => setSortAsc((p) => !p) }/>
      </div>

      <PlaylistGrid
        playlists={ sortedPlaylists }
        onEdit={ editPlaylist }
        onDelete={ deletePlaylist }
        onClick={ setActivePl }/>
    </div>
  );
};

export default PlaylistPage;