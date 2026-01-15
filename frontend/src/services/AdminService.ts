import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";
import { SystemStatistics } from "../models/Statistics";
import { AdminUserDto } from "../models/User";

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRolesRequest {
  roles: string[];
}

export const getAllUsers = async (): Promise<AdminUserDto[]> => {
  const response = await axios.get(`${API_BASE_URL}/admin/users`, {
    withCredentials: true,
  });
  return response.data;
};

export const createUser = async (request: CreateUserRequest): Promise<AdminUserDto> => {
  const response = await axios.post(`${API_BASE_URL}/admin/users`, request, {
    withCredentials: true,
  });
  return response.data;
};

export const updateUserRoles = async (userId: string, request: UpdateUserRolesRequest): Promise<void> => {
  await axios.put(`${API_BASE_URL}/admin/users/${userId}/roles`, request, {
    withCredentials: true,
  });
};

export const sendPasswordResetEmail = async (userId: string): Promise<void> => {
  await axios.post(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {}, {
    withCredentials: true,
  });
};

export const getSystemStatistics = async (): Promise<SystemStatistics> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/statistics`, {
      withCredentials: true,
    });
    console.log("Statistics API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
};

