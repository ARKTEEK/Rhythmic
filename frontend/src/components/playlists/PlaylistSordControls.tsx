import { FaSortAlphaDown, FaSortAmountDown } from "react-icons/fa";

export type SortKey = "title" | "itemCount" | "privacyStatus";

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
      value={ sortKey }
      onChange={ (e) => setSortKey(e.target.value as SortKey) }
      className="bg-gray-800 border border-gray-600 text-gray-300 rounded px-3 py-1
      focus:outline-none text-sm">
      <option value="title">Name</option>
      <option value="itemCount">Songs</option>
      <option value="privacyStatus">Privacy</option>
    </select>
    <button
      onClick={ toggleSortOrder }
      title="Toggle ascending / descending"
      className="hover:text-red-400">
      { sortAsc ? <FaSortAlphaDown/> : <FaSortAmountDown/> }
    </button>
  </div>
);

export default PlaylistSortControls;
