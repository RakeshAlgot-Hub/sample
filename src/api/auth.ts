import client from './client';
import { User } from '../types';

export const authApi = {
  // Redirect to backend Google OAuth endpoint
  initiateGoogleLogin: (): void => {
    window.location.href = `${client.defaults.baseURL}/auth/google`;
  },

  // Handle OAuth callback and exchange code for user data
  handleCallback: async (code: string, state?: string): Promise<User> => {
    const response = await client.post('/auth/callback', { code, state });
    
    // Store the token
    if (response.data.accessToken) {
      localStorage.setItem('auth_token', response.data.accessToken);
    }
    
    return response.data.user;
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await client.get('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },

  // Refresh token
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await client.post('/auth/refresh');
    if (response.data.accessToken) {
      localStorage.setItem('auth_token', response.data.accessToken);
    }
    return response.data;
  },
};