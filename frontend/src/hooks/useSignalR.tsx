import * as signalR from "@microsoft/signalr";
import { useCallback, useEffect, useRef, useState } from "react";
import { JobType } from "../enums/JobType.ts";
import { ProgressPayload, StartJobResponse } from "../models/ProcessPayload.ts";
import { ProviderTrack } from "../models/ProviderTrack.ts";
import { cancelJobRequest, createHubConnection, startDuplicateScan, startTransferJob } from "../services/SignalRService.ts";

export function useSignalR() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [activeJobType, setActiveJobType] = useState<JobType | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const [currentTrack, setCurrentTrack] = useState<ProviderTrack | null>(null);

  const [processedTracksMap, setProcessedTracksMap] = useState<Partial<Record<JobType, ProviderTrack[]>>>({});


  const hubRef = useRef<signalR.HubConnection | null>(null);

  const resetState = useCallback(() => {
    setProcessedTracksMap;
    setCurrentTrack(null);
    setIsRunning(false);
    setJobId(null);
    setActiveJobType(null);
  }, []);

  useEffect(() => {
    return () => {
      if (hubRef.current) {
        hubRef.current.stop();
      }
    };
  }, []);

  const startJob = useCallback(async (type: JobType, requestBody: object) => {
    resetState();

    try {
      let data: StartJobResponse;
      if (type === JobType.FindDuplicateTracks) {
        data = await startDuplicateScan(requestBody);
      } else if (type === JobType.TransferPlaylist) {
        data = await startTransferJob(requestBody);
      } else {
        throw new Error("Unknown Job Type");
      }

      const newJobId = data.jobId;
      setJobId(newJobId);
      setActiveJobType(type);

      const hub = createHubConnection();

      hub.on("ProgressUpdate", (payload: ProgressPayload) => {
        if (payload.jobId !== newJobId) return;

        setCurrentTrack(payload.track);

        if (payload.removed) {
          console.log(`[${type}] Matched track: ${payload.track.title} by ${payload.track.artist}`);
          console.log(`Track URL: ${payload.track.trackUrl}`);

          setProcessedTracksMap(prev => {
            const existing = prev[type] || [];
            return { ...prev, [type]: [...existing, payload.track] };
          });
        }
      });

      hub.on("JobCompleted", (payload) => {
        if (payload.jobId !== newJobId) return;
        setIsRunning(false);
        // Optional: hub.stop();
      });

      hub.on("JobCancelled", (payload) => {
        if (payload.jobId !== newJobId) return;
        setIsRunning(false);
        alert('Job was cancelled');
      });

      hub.on("JobFailed", (payload) => {
        if (payload.jobId !== newJobId) return;
        setIsRunning(false);
        console.error("Job failed:", payload.error);
        alert(`Job failed: ${payload.error}`);
      });

      // 3. Connect and Subscribe
      await hub.start();
      await hub.invoke("Subscribe", newJobId);

      hubRef.current = hub;
      setIsRunning(true);

    } catch (error) {
      console.error("Failed to start job", error);
      setIsRunning(false);
    }
  }, [resetState]);

  const cancelJob = useCallback(async () => {
    if (!jobId) return;
    await cancelJobRequest(jobId);
  }, [jobId]);

  return {
    jobId,
    activeJobType,
    isRunning,
    currentTrack,
    processedTracksMap,
    setProcessedTracksMap,
    startJob,
    cancelJob,
    clearResults: resetState
  };
}
