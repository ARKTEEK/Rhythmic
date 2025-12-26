import { useMemo, useState } from "react";
import { PlaylistSnapshot } from "../../models/PlaylistSnapshot.ts";

type DateFilter = "all" | "today" | "week" | "month";

export const useSnapshotFilter = (snapshots: PlaylistSnapshot[]) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customDate, setCustomDate] = useState<string>("");

  const filterSnapshotsByDate = (snapshots: PlaylistSnapshot[]): PlaylistSnapshot[] => {
    if (customDate) {
      const selectedDate = new Date(customDate);
      return snapshots.filter(snapshot => {
        const snapshotDate = new Date(snapshot.createdAt);
        return snapshotDate.toDateString() === selectedDate.toDateString();
      });
    }

    if (dateFilter === "all") return snapshots;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return snapshots.filter(snapshot => {
      const snapshotDate = new Date(snapshot.createdAt);

      switch (dateFilter) {
        case "today":
          return snapshotDate >= todayStart;
        case "week":
          return snapshotDate >= weekStart;
        case "month":
          return snapshotDate >= monthStart;
        default:
          return true;
      }
    });
  };

  const filteredSnapshots = useMemo(
    () => filterSnapshotsByDate(snapshots),
    [snapshots, dateFilter, customDate]
  );

  return {
    dateFilter,
    setDateFilter,
    customDate,
    setCustomDate,
    filteredSnapshots,
  };
};

