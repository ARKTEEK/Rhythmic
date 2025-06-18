import { FaSortAlphaDown, FaSortAmountDown } from "react-icons/fa";

export type SortKey = "name" | "songCount" | "lengthMin";

interface SortControlsProps {
  sortKey: SortKey;
  sortAsc: boolean;
  setSortKey: (key: SortKey) => void;
  toggleSortOrder: () => void;
}

const PlaylistSortControls = ({
  sortKey,
  sortAsc,
  setSortKey,
  toggleSortOrder,
}: SortControlsProps) => (
  <div className="flex items-center gap-3 text-gray-300">
    <select
      value={sortKey}
      onChange={(e) => setSortKey(e.target.value as SortKey)}
      className="bg-transparent border border-gray-600 rounded px-3 py-1 focus:outline-none text-sm"
    >
      <option value="name">Name</option>
      <option value="songCount"># Songs</option>
      <option value="lengthMin">Length</option>
    </select>
    <button
      onClick={toggleSortOrder}
      title="Toggle ascending / descending"
      className="hover:text-red-400"
    >
      {sortAsc ? <FaSortAlphaDown /> : <FaSortAmountDown />}
    </button>
  </div>
);

export default PlaylistSortControls;
