export interface User {
  id: string;
  email: string;
  createdDate: string;
  keycloakId: string;
  username: string;
  role?: string;
  isEmailVerified?: boolean;
  profilePicture?: string | null;
  provider?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export type LoginCredentials = LoginData;



