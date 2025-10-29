/**
 * Shared auth request/response interfaces
 * These match frontend expectations and backend responses
 */

export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string; // Optional - backend will use default if not provided
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId?: string; // Optional - backend will use default if not provided
  role?: string; // Optional - defaults to 'employee'
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantResponse {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
  tenant?: TenantResponse;
}

export interface RegisterResponse {
  message: string;
  user: UserResponse;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface ForgotPasswordRequest {
  email: string;
  tenantId?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  tenantId?: string;
}

export interface VerifyOTPResponse {
  message: string;
  resetToken: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  tenantId?: string;
}

export interface ResetPasswordResponse {
  message: string;
}
