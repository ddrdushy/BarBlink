import type { ISODate, ISODateTime } from './common';
import type { UserStatus } from './user';

// --- Request types ---

export interface RegisterRequest {
  phone: string;
  email: string;
  dateOfBirth: ISODate;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// --- Response types ---

export interface RegisterResponse {
  userId: string;
  message: string;
}

export interface SendOtpResponse {
  message: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  email: string;
  phoneVerified: boolean;
  dateOfBirth: ISODate;
  status: UserStatus;
  createdAt: ISODateTime;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

// --- API envelope ---

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { statusCode: number; message: string } | null;
}
