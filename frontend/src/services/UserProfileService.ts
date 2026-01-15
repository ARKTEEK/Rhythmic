import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const updateProfile = async (request: UpdateProfileRequest): Promise<void> => {
  await axios.put(`${API_BASE_URL}/user/profile`, request, {
    withCredentials: true,
  });
};

export const changePassword = async (request: ChangePasswordRequest): Promise<void> => {
  await axios.post(`${API_BASE_URL}/user/change-password`, request, {
    withCredentials: true,
  });
};

