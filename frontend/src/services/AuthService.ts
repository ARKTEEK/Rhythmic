import axios from "axios";
import { API_BASE_URL } from "../configs/Config.ts";
import { AuthData, AuthResponse } from "../models/User.ts";

export const registerUser = async (data: AuthData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/register`,
    data
  );
  return response.data;
};

export const loginUser = async (data: AuthData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/login`,
    data
  );
  return response.data;
};

export const handleGoogleOAuthCallback = async (
  code: string,
  state: string,
  jwt: string,
  signal?: AbortSignal
): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/oauth/google/callback`,
    { code, state },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      signal,
    }
  );
};
