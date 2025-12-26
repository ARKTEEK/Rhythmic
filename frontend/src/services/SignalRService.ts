import * as signalR from "@microsoft/signalr";
import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";
import { OAuthProvider } from "../models/Connection.ts";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function startDuplicateScan(requestBody: {
  provider: OAuthProvider;
  providerAccountId: string;
  playlistId: string;
}) {
  const response = await apiClient.post("/jobs/duplicates", requestBody);
  return response.data;
}

export async function startTransferJob(req: {
  sourceProvider: OAuthProvider;
  sourceAccountId: string;
  sourcePlaylistId: string;
  destinationProvider: OAuthProvider;
  destinationAccountId: string;
}) {
  const response = await apiClient.post("/jobs/transfer", req);
  return response.data;
}

export function createHubConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl("https://127.0.0.1:7184/progressHub")
    .withAutomaticReconnect()
    .build();
}

export async function cancelJobRequest(jobId: string) {
  await apiClient.post(`/jobs/${jobId}/cancel`);
}
