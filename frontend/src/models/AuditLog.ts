export enum AuditType {
  PlaylistTrasnferred = 0,
  PlaylistDeleted = 1,
  PLaylistUpdated = 2,
  Track = 3,
  PlaylistCreated = 4,
  PlaylistSplit = 5,
  TrackAdded = 6,
  TrackRemoved = 7,
}

export enum ExecutorType {
  USER = 0,
  ADMIN = 1,
  SYSTEM = 2,
}

export type AuditLog = {
  id: number;
  executor: ExecutorType;
  type: AuditType;
  description?: string;
  createdAt: string;
};

// Helper function to convert AuditType to action string
export const getActionString = (type: AuditType): string => {
  switch (type) {
    case AuditType.PlaylistTrasnferred:
      return "TRANSFER";
    case AuditType.PlaylistDeleted:
      return "DELETE_PLAYLIST";
    case AuditType.PLaylistUpdated:
      return "UPDATE_PLAYLIST";
    case AuditType.Track:
      return "TRACK";
    case AuditType.PlaylistCreated:
      return "CREATE_PLAYLIST";
    case AuditType.PlaylistSplit:
      return "SPLIT_PLAYLIST";
    case AuditType.TrackAdded:
      return "ADD_TRACK";
    case AuditType.TrackRemoved:
      return "REMOVE_TRACK";
    default:
      return "UNKNOWN";
  }
};

// Helper function to get executor name
export const getExecutorName = (executor: ExecutorType): string => {
  switch (executor) {
    case ExecutorType.USER:
      return "User";
    case ExecutorType.ADMIN:
      return "Admin";
    case ExecutorType.SYSTEM:
      return "System";
    default:
      return "Unknown";
  }
};
