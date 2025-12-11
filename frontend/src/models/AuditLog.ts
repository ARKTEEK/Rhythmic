export type AuditLog = {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  playlistId?: string;
  playlistTitle?: string;
  actor?: string;
};
