export interface LoginRequest {
  username: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: unknown[];
}
