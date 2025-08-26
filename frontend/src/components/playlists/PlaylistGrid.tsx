import { Playlist } from "../../models/Playlist";
import PlaylistCard from "./PlaylistCard";

interface PlaylistGridProps {
  playlists: Playlist[];
  onEdit: (pl: Playlist) => void;
  onDelete: (id: number) => void;
  onClick: (pl: Playlist) => void;
}

const PlaylistGrid = ({
                        playlists,
                        onEdit,
                        onDelete,
                        onClick,
                      }: PlaylistGridProps) => (
  <div className="overflow-y-auto max-h-[51vh] pr-0 pb-3">
    <div className="grid gap-3 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
      { playlists.map((pl) => (
        <PlaylistCard
          key={ pl.id }
          playlist={ pl }
          onEdit={ onEdit }
          onDelete={ onDelete }
          onClick={ onClick }
        />
      )) }
    </div>
  </div>
);

export default PlaylistGrid;
