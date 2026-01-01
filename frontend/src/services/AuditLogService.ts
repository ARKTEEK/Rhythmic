import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";
import { AuditLog } from "../models/AuditLog.ts";

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await axios.get<AuditLog[]>(`${API_BASE_URL}/logs`);
  return response.data;
};

