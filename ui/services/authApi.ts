import { requestJson } from './apiClient';
import { User } from '@/types/user';

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken?: string;
}

export const authApi = {
    login: (email: string, password: string) =>
        requestJson<AuthResponse>('/auth/login', 'POST', { email, password }, { auth: false }),
    signup: (name: string, email: string, password: string) =>
        requestJson<AuthResponse>('/auth/signup', 'POST', { name, email, password }, { auth: false }),
    getProfile: () => requestJson<User>('/auth/me', 'GET'),
    logout: () => requestJson<void>('/auth/logout', 'POST'),
};
