export interface AuthUser {
  _id: string;
  username: string;
  fullName: string;
  profilePicture?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
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
  logout(token: string): Promise<AuthResponse>;
}
