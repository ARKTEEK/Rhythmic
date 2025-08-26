import axios from "axios";
import { API_BASE_URL } from "../configs/Config.ts";

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
