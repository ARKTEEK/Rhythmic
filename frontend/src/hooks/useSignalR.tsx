import { useCallback, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { ProviderTrack } from "../models/ProviderTrack.ts";
import {
  cancelJobRequest,
  createHubConnection,
  startJobRequest
} from "../services/SignalRService.ts";
import { Payload } from "../models/JobPayload.ts";

export function useSignalR() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<ProviderTrack | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [duplicateTracks, setDuplicateTracks] = useState<ProviderTrack[]>([]);

  const hubRef = useRef<signalR.HubConnection | null>(null);

  const startJob = useCallback(async (requestBody: object) => {
    const data = await startJobRequest(requestBody);
    const newJobId = data.jobId;
    setJobId(newJobId);

    const hub = createHubConnection();

    hub.on("ProgressUpdate", (payload: Payload) => {
      if (payload.jobId !== newJobId) return;

      setCurrentTrack(payload.track);

      if (payload.removed) {
        setDuplicateTracks(prev => [...prev, payload.track]);
      }
    });

    hub.on("JobCompleted", (payload) => {
      if (payload.jobId !== newJobId) return;
      setIsRunning(false);
    });

    hub.on("JobCancelled", (payload) => {
      if (payload.jobId !== newJobId) return;
      setIsRunning(false);
    });

    hub.on("JobFailed", (payload) => {
      if (payload.jobId !== newJobId) return;
      setIsRunning(false);
    });

    await hub.start();
    await hub.invoke("Subscribe", newJobId);

    hubRef.current = hub;
    setIsRunning(true);
  }, []);

  const cancelJob = useCallback(async () => {
    if (!jobId) return;
    await cancelJobRequest(jobId);
  }, [jobId]);

  return {
    jobId,
    currentTrack,
    isScanning: isRunning,
    duplicateTracks,
    startJob,
    cancelJob,
  };
}
