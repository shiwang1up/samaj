export interface AuthResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio: string;
}

export interface IAuthService {
  login(email: string, password: string): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
}
