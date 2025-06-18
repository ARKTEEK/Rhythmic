import { useMemo, useState } from "react";
import PlaylistGrid from "../components/playlists/PlaylistGrid";
import PlaylistSortControls from "../components/playlists/PlaylistSordControls";
import { mockPlaylists } from "../data/MockPlaylists";
import { Playlist } from "../models/Playlist";

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);

  type SortKey = "name" | "songCount" | "lengthMin";
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const sortedPlaylists = useMemo(() => {
    const copy = [...playlists];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "songCount":
          cmp = a.songCount - b.songCount;
          break;
        case "lengthMin":
          cmp = a.lengthMin - b.lengthMin;
          break;
        case "name":
        default:
          cmp = a.name.localeCompare(b.name);
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
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="w-full mx-auto py-8 flex flex-col space-y-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <h1 className="text-5xl font-extrabold text-red-400">Your Playlists</h1>
        <PlaylistSortControls
          sortKey={sortKey}
          sortAsc={sortAsc}
          setSortKey={setSortKey}
          toggleSortOrder={() => setSortAsc((p) => !p)}
        />
      </div>

      <PlaylistGrid
        playlists={sortedPlaylists}
        onEdit={editPlaylist}
        onDelete={deletePlaylist}
        onClick={setActivePl}
      />
    </div>
  );
};

export default PlaylistPage;
