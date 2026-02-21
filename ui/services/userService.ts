import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApi, setTokens, clearTokens, handleApiError, ApiError } from '@/lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const userService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const api = getApi();
      // No secret sent from frontend
      const response = await api.post<AuthResponse>(
        '/auth/register',
        data
      );

      const { accessToken, refreshToken } = response.data;
      await setTokens(accessToken, refreshToken);

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const api = getApi();
      const response = await api.post<AuthResponse>('/auth/login', data);

      const { accessToken, refreshToken } = response.data;
      await setTokens(accessToken, refreshToken);

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      const api = getApi();
      const refreshToken = await AsyncStorage.getItem('@tenant_tracker_refresh_token');
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearTokens();
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const api = getApi();
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      const api = getApi();
      const response = await api.post<AuthResponse>('/auth/refresh');
      const { accessToken, refreshToken } = response.data;
      await setTokens(accessToken, refreshToken);
      return response.data;
    } catch (error) {
      await clearTokens();
      throw handleApiError(error);
    }
  },
};
