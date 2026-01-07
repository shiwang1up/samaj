export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface IAuthService {
  login(username: string, password: string): Promise<LoginResponse>;
}
