import { useState } from "react";

type ConfirmAction = "revert" | "delete" | null;

export const useSnapshotConfirmation = () => {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [pendingSnapshotId, setPendingSnapshotId] = useState<number | null>(null);

  const requestRevert = (snapshotId: number) => {
    setPendingSnapshotId(snapshotId);
    setConfirmAction("revert");
  };

  const requestDelete = (snapshotId: number) => {
    setPendingSnapshotId(snapshotId);
    setConfirmAction("delete");
  };

  const confirm = () => {
    const result = { action: confirmAction, snapshotId: pendingSnapshotId };
    setConfirmAction(null);
    setPendingSnapshotId(null);
    return result;
  };

  const cancel = () => {
    setConfirmAction(null);
    setPendingSnapshotId(null);
  };

  return {
    confirmAction,
    pendingSnapshotId,
    requestRevert,
    requestDelete,
    confirm,
    cancel,
  };
};

