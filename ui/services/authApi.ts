import { requestJson } from './apiClient';

// Should match backend's User schema
export interface User {
    id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string; // ISO string
}

export interface TokenSet {
    accessToken: string;
    refreshToken?: string;
}

// Response from login/signup will include user details and tokens
export interface LoginResponse extends User, TokenSet {}

interface DeviceMetaData {
    deviceId: string;
    platform: string;
    appVersion: string;
}

export const authApi = {
    login: (email: string | undefined, phoneNumber: string | undefined, password: string, device: DeviceMetaData) =>
        requestJson<LoginResponse>('/auth/login', 'POST', { email, phoneNumber, password, device }, { auth: false }),
    signup: (fullName: string, email: string | undefined, phoneNumber: string | undefined, password: string, device: DeviceMetaData) =>
        requestJson<LoginResponse>('/auth/signup', 'POST', { fullName, email, phoneNumber, password, device }, { auth: false }),
    getProfile: () => requestJson<User>('/auth/me', 'GET'), // getProfile now returns only User details
    logout: (deviceId: string) => requestJson<void>('/auth/logout', 'POST', { deviceId }, undefined, { headers: { 'X-Device-Id': deviceId } }),
    refresh: (refreshToken: string, deviceId: string) =>
        requestJson<TokenSet>('/auth/refresh', 'POST', { refreshToken, deviceId }, { auth: false }),
};

