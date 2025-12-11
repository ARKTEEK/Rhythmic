import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { AuditLogTable } from "../../components/audit/AuditLogsTable";
import { PaginationControls } from "../../components/playlists/PaginationControls";
import { SearchBar } from "../../components/ui/SearchBar";
import Window from "../../components/ui/Window";
import { AuditLog } from "../../models/AuditLog";

const seedLogs: AuditLog[] = [
  { id: "1", timestamp: "2025-12-11T08:12:00Z", action: "SYNC", details: "Placeholder", playlistId: "p1", playlistTitle: "Title", actor: "Displayname" },
  { id: "2", timestamp: "2025-12-11T08:25:00Z", action: "DELETE_SONG", details: "Placeholder", playlistId: "p1", playlistTitle: "Title", actor: "Displayname" },
  { id: "3", timestamp: "2025-12-11T09:02:00Z", action: "CONVERT", details: "Placeholder", playlistId: "p2", playlistTitle: "Title", actor: "Displayname" },
  { id: "4", timestamp: "2025-12-11T10:11:00Z", action: "SYNC", details: "Placeholder", playlistId: "p3", playlistTitle: "Title", actor: "System" },
  { id: "5", timestamp: "2025-12-11T10:35:00Z", action: "DELETE_SONG", details: "Placeholder", playlistId: "p4", playlistTitle: "Title", actor: "Displayname" },
  { id: "6", timestamp: "2025-12-11T11:00:00Z", action: "SYNC", details: "Placeholder", playlistId: "p5", playlistTitle: "Title", actor: "System" },
  { id: "7", timestamp: "2025-12-11T11:05:00Z", action: "DELETE_SONG", details: "Placeholder", playlistId: "p5", playlistTitle: "Title", actor: "Displayname" },
  { id: "8", timestamp: "2025-12-11T12:24:00Z", action: "CONVERT", details: "Placeholder", playlistId: "p6", playlistTitle: "Title", actor: "Displayname" },
  { id: "9", timestamp: "2025-12-11T12:33:00Z", action: "SYNC", details: "Placeholder", playlistId: "p6", playlistTitle: "Title", actor: "System" },
  { id: "10", timestamp: "2025-12-10T23:50:00Z", action: "SYNC", details: "Placeholder", playlistId: "p3", playlistTitle: "Title", actor: "System" },
];

export default function AuditLogsPage() {
  const [logs] = useState<AuditLog[]>(() =>
    [...seedLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  );

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<"ALL" | string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  function filteredLogs(src: AuditLog[], s: string, action: string) {
    return src.filter((log) => {
      const matchesSearch =
        !s.trim() ||
        log.details.toLowerCase().includes(s.toLowerCase()) ||
        log.action.toLowerCase().includes(s.toLowerCase()) ||
        (log.playlistTitle || "").toLowerCase().includes(s.toLowerCase());

      const matchesAction = action === "ALL" || log.action === action;
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
                  <option value="SYNC">Sync</option>
                  <option value="DELETE_SONG">Delete Song</option>
                  <option value="CONVERT">Convert</option>
                </select>
              </div>
            </div>
          </div>

          <AuditLogTable
            logs={pageItems}
            onSelectLog={setSelectedLog} />

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
