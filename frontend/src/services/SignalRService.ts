import * as signalR from "@microsoft/signalr";
import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function startJobRequest(requestBody: object) {
  const response = await apiClient.post("/jobs/start", requestBody);
  return response.data;
}

export function createHubConnection() {
  return new signalR.HubConnectionBuilder()
  .withUrl("https://127.0.0.1:7184/progressHub")
  .withAutomaticReconnect()
  .build();
}

export async function cancelJobRequest(jobId: string) {
  await apiClient.post(`/jobs/${ jobId }/cancel`);
}
