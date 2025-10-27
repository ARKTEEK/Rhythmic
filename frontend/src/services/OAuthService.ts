import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";
import { Connection } from "../models/Connection.ts";

export const handleOAuthCallback = async (
  provider: "google" | "spotify",
  code: string,
  state: string,
  jwt: string
): Promise<void> => {
  if (!code || !state) {
    console.error(`Missing ${ provider } code or state in query string`);
    return;
  }

  try {
    await axios.post(
      `${ API_BASE_URL }/oauth/${ provider }/callback`,
      { code, state },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ jwt }`,
        },
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error(`${ provider } OAuth callback failed:`, error);
  }
};

export const disconnectOAuth = async (provider: string, providerId: string) => {
  await axios.delete(`${ API_BASE_URL }/oauth/${ provider }/disconnect`, {
    params: {
      providerId: providerId,
    },
  });
}

export const getConnections = async (): Promise<Connection[]> => {
  const response = await axios.get<Connection[]>(`${ API_BASE_URL }/account-profiles`);
  return response.data;
}