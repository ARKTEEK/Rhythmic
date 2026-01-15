export interface UserDto {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  exp?: number;
  roles?: string[];
}

export interface AuthData {
  email: string;
  password: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
}

export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  actionsCount: number;
  tokensCount: number;
}
