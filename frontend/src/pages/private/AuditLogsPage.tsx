import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { AuditLogTable } from "../../components/audit/AuditLogsTable";
import { PaginationControls } from "../../components/playlists/PaginationControls";
import { SearchBar } from "../../components/ui/SearchBar";
import Window from "../../components/ui/Window";
import { AuditLog, getActionString } from "../../models/AuditLog";
import { getAuditLogs } from "../../services/AuditLogService";

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["audit-logs"],
    queryFn: getAuditLogs,
  });

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<"ALL" | string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 11;

  function filteredLogs(src: AuditLog[], s: string, action: string) {
    return src.filter((log) => {
      const actionString = getActionString(log.type);
      const matchesSearch =
        !s.trim() ||
        (log.description || "").toLowerCase().includes(s.toLowerCase()) ||
        actionString.toLowerCase().includes(s.toLowerCase());

      const matchesAction = action === "ALL" || actionString === action;
      return matchesSearch && matchesAction;
    });
  }

  const filtered = useMemo(() => filteredLogs(logs, search, actionFilter), [
    logs,
    search,
    actionFilter,
  ]);

  const totalResults = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  if (page > totalPages) setPage(1);

  const pageStart = (page - 1) * pageSize;
  const pageItems = filtered.slice(pageStart, pageStart + pageSize);

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  return (
    <div className="p-6 font-mono flex flex-col text-black h-full w-full overflow-hidden">
      <Window
        containerClassName="w-full h-full box-style-md overflow-hidden bg-gradient-to-b from-[#fff6e7] to-[#fff3db]"
        ribbonClassName="bg-[#ff9f8a] border-b-4 border-black text-white font-extrabold"
        windowClassName="bg-[#fff9ec]"
        ribbonContent={
          <div className="flex items-center justify-between w-full px-4 py-1">
            <h2 className="text-lg text-black uppercase tracking-wider">
              Audit Logs ({totalResults})
            </h2>
          </div>
        }>
        <div className="p-4 flex flex-col h-full gap-4 overflow-hidden">
          <div className="flex flex-wrap gap-3 items-center bg-[#fff5df] p-3 border-2 border-black rounded box-style-md">

            <div className="flex w-full gap-3">

              <SearchBar value={search} onChange={(e) => {
                setSearch("");
                setPage(1);
              }} />

              <div className="flex items-center gap-2 bg-white px-2 border-2 border-black box-style-sm">
                <Filter className="w-4 h-4" />
                <select
                  className="bg-transparent py-1 focus:outline-none"
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value as any);
                    setPage(1);
                  }}>
                  <option value="ALL">All Actions</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="DELETE_PLAYLIST">Delete Playlist</option>
                  <option value="UPDATE_PLAYLIST">Update Playlist</option>
                  <option value="CREATE_PLAYLIST">Create Playlist</option>
                  <option value="SPLIT_PLAYLIST">Split Playlist</option>
                  <option value="ADD_TRACK">Add Track</option>
                  <option value="REMOVE_TRACK">Remove Track</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center italic text-gray-600">
              Loading audit logs...
            </div>
          ) : (
            <AuditLogTable
              logs={pageItems}
              onSelectLog={setSelectedLog} />
          )}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </Window>

      {selectedLog &&
        <div className="">
        </div>
      }
    </div>
  );
}
