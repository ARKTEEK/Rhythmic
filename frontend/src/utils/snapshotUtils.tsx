import { PlaylistSnapshot, PlaylistSnapshotComparison } from "../models/PlaylistSnapshot.ts";

export const formatSnapshotChange = (snapshot: PlaylistSnapshot) => {
  const additions = snapshot.addedCount ?? 0;
  const removals = snapshot.removedCount ?? 0;
  return { additions, removals };
};

export const getTrackKey = (track: any): string => {
  return track.trackUrl || track.id || `${track.title}|${track.artist}`;
};

export const isPlaylistIdentical = (comparison: PlaylistSnapshotComparison): boolean => {
  if (comparison.snapshotTracks.length !== comparison.currentTracks.length) {
    return false;
  }

  const snapshotByPosition = new Map<number, string>();
  const currentByPosition = new Map<number, string>();

  comparison.snapshotTracks.forEach(track => {
    const position = track.position ?? 0;
    snapshotByPosition.set(position, getTrackKey(track));
  });

  comparison.currentTracks.forEach(track => {
    const position = track.position ?? 0;
    currentByPosition.set(position, getTrackKey(track));
  });

  if (snapshotByPosition.size !== currentByPosition.size) {
    return false;
  }

  for (const [position, snapshotTrackKey] of snapshotByPosition) {
    const currentTrackKey = currentByPosition.get(position);
    if (currentTrackKey !== snapshotTrackKey) {
      return false;
    }
  }

  return true;
};

export const calculateTrackDiff = (comparison: PlaylistSnapshotComparison) => {
  const snapshotCounts = new Map<string, number>();
  const currentCounts = new Map<string, number>();

  comparison.snapshotTracks.forEach(track => {
    const key = getTrackKey(track);
    snapshotCounts.set(key, (snapshotCounts.get(key) || 0) + 1);
  });

  comparison.currentTracks.forEach(track => {
    const key = getTrackKey(track);
    currentCounts.set(key, (currentCounts.get(key) || 0) + 1);
  });

  const snapshotTracksProcessed = new Map<string, number>();
  const snapshotRows = comparison.snapshotTracks.map(track => {
    const key = getTrackKey(track);
    const instanceNum = (snapshotTracksProcessed.get(key) || 0) + 1;
    snapshotTracksProcessed.set(key, instanceNum);

    const currentCount = currentCounts.get(key) || 0;
    const isRemoved = instanceNum > currentCount;

    return { track, isRemoved };
  });

  const currentTracksProcessed = new Map<string, number>();
  const currentRows = comparison.currentTracks.map(track => {
    const key = getTrackKey(track);
    const instanceNum = (currentTracksProcessed.get(key) || 0) + 1;
    currentTracksProcessed.set(key, instanceNum);

    const snapshotCount = snapshotCounts.get(key) || 0;
    const isAdded = instanceNum > snapshotCount;

    return { track, isAdded };
  });

  return { snapshotRows, currentRows };
};

