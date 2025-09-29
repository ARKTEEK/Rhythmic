import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";
import { AuthData, AuthResponse } from "../models/User.ts";

export const registerUser = async (data: AuthData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${ API_BASE_URL }/auth/register`,
    data
  );
  return response.data;
};

export const loginUser = async (data: AuthData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${ API_BASE_URL }/auth/login`,
    data
  );
  return response.data;
};

