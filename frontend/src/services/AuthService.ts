import axios from "axios";
import { AuthData, AuthResponse } from "../entities/User.ts";
import { API_BASE_URL } from "../configs/Config.ts";

export const registerUser = async (data: AuthData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${ API_BASE_URL }/api/auth/register`, data);
  return response.data;
};

export const loginUser = async (data: AuthData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${ API_BASE_URL }/api/auth/login`, data);
  return response.data;
};
