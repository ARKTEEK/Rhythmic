import { FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { Playlist } from "../../models/Playlist";

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: (playlist: Playlist) => void;
  onEdit: (playlist: Playlist) => void;
  onDelete: (id: number) => void;
}
const PlaylistCard = ({
  playlist,
  onClick,
  onEdit,
  onDelete,
}: PlaylistCardProps) => {
  const sourceBadgeClass =
    playlist.source === "spotify" ? "bg-green-600/80" : "bg-red-600/80";

  const sourceText = playlist.source === "spotify" ? "Spotify" : "YouTube";

  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden bg-gray-700/40 backdrop-blur-lg border border-gray-600/50 shadow transition-shadow duration-300 ease-in-out
                 hover:shadow-lg hover:shadow-red-500/20 cursor-pointer max-w-xs group"
      onClick={() => onClick(playlist)}
    >
      <div className="relative h-20 w-full overflow-hidden">
        <img
          src={playlist.imageUrl}
          alt={playlist.name}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white shadow-md z-20 ${sourceBadgeClass}`}
        >
          {sourceText}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-1 bg-gray-700/40 group-hover:bg-gray-600/50 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{playlist.name}</h3>
          <div className="flex gap-2">
            <FaPencil
              size={16}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(playlist);
              }}
              className="text-gray-400 hover:text-white transition"
            />
            <FaTrash
              size={16}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(playlist.id);
              }}
              className="text-gray-400 hover:text-red-400 transition"
            />
          </div>
        </div>

        <div className="text-sm text-gray-300">
          {playlist.songCount} songs • {playlist.lengthMin} min
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;
