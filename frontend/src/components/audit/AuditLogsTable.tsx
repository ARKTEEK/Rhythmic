import { Activity, Clock, FileText, SortDesc } from "lucide-react";
import { AuditLog, getActionString, getExecutorName } from "../../models/AuditLog";
import { formatDateOnly, formatTime } from "../../utils/formatUtils";
import ActionIcon from "../ui/Icon/ActionIcon";

type AuditLogTableProps = {
  logs: AuditLog[];
  onSelectLog: (log: AuditLog) => void;
};

export function AuditLogTable({ logs, onSelectLog }: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center italic text-gray-600">
        No logs found.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto box-style-md rounded-lg bg-[#fffef8] border-2 border-black">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <colgroup>
          <col className="w-[12%]" />
          <col className="w-[15%]" />
          <col className="w-[78%]" />
        </colgroup>

        <thead className="bg-[#f3d99c] border-b-4 border-black sticky top-0 z-10">
          <tr className="h-[48px]">
            <th className="px-2 text-left font-extrabold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#d46a5d]" />
                When
                <SortDesc className="w-3 h-3 text-xs opacity-70" />
              </div>
            </th>
            <th className="px-2 text-center font-extrabold uppercase tracking-wider min-w-[70px]">
              <div className="flex items-center justify-center gap-1">
                <Activity className="w-4 h-4 text-[#40a8d0]" />
                Action
              </div>
            </th>
            <th className="pl-12 pr-2 text-left font-extrabold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-[#5cb973]" />
                Details
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log, i) => (
            <tr
              key={log.id.toString()}
              className={`
                h-[56px] transition-all
                ${i % 2 === 0 ? "bg-[#fffaf0]" : "bg-[#fff3e6]"}
                hover:bg-[#ffe9c2]
              `}>
              <td className="px-2 py-1 align-middle">
                <div className="group inline-block">
                  <span className="text-xs font-bold" aria-hidden>
                    {formatDateOnly(log.createdAt)}
                  </span>
                  <span
                    tabIndex={0}
                    className="ml-2 text-xs opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-150 focus:outline-none"
                    title={new Date(log.createdAt).toLocaleString()}
                    style={{ textDecoration: "underline dotted" }}>
                    {formatTime(log.createdAt)}
                  </span>
                </div>
              </td>

              <td className="px-2 py-1 text-center align-middle">
                <div className="flex justify-center">
                  {(() => {
                    const actionLabel = getActionString(log.type).replace(/_/g, " ");
                    return (
                      <ActionIcon
                        action={getActionString(log.type)}
                        label={actionLabel}
                      />
                    );
                  })()}
                </div>
              </td>

              <td className="pl-12 pr-2 py-2 align-middle max-w-[48ch] break-words">
                <div className="text-sm font-medium">{log.description || "No description"}</div>
                <div className="text-xs text-gray-600 mt-1 flex gap-2">
                  <span>
                    <strong>By:</strong> {getExecutorName(log.executor)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
