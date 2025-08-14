export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}
