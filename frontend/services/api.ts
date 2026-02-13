import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenMemory';
import { getRefreshToken, logout } from './authUtils';
import { saveItem } from './secureStore';
import { isTokenExpiringSoon, isTokenExpired, decodeJwt } from '@/utils/jwt';
import { AppState } from 'react-native';
import { getBackendApiUrl } from '@/utils/env';

export const API_BASE_URL = getBackendApiUrl();// TODO: Set your real backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Proactive refresh on app resume
let lastRefreshAttempt = 0;
AppState.addEventListener('change', async (state) => {
  if (state === 'active') {
    const token = getAccessToken();
    if (token && isTokenExpiringSoon(token, 5)) {
      // Prevent rapid refresh loops
      const now = Date.now();
      if (now - lastRefreshAttempt > 3000) {
        lastRefreshAttempt = now;
        try {
          const refreshToken = await getRefreshToken();
          if (refreshToken) {
            const response = await api.post('/auth/refresh', { refreshToken });
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            setAccessToken(accessToken);
            if (newRefreshToken) {
              await saveItem('refresh_token', newRefreshToken);
            }
          }
        } catch (err) {
          await logout();
          // Optionally show session expired message
        }
      }
    }
  }
});

// Request interceptor: check access token expiry before every request
api.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token && isTokenExpiringSoon(token, 2)) {
      // Refresh proactively
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          setAccessToken(accessToken);
          if (newRefreshToken) {
            await saveItem('refresh_token', newRefreshToken);
          }
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        } catch (err) {
          await logout();
          throw new Error('Session expired');
        }
      }
    }
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and refresh

let isRefreshing = false;
let failedQueue: any[] = [];
let refreshAttempts = 0;

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts++;
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setAccessToken(accessToken);
        if (newRefreshToken) {
          await saveItem('refresh_token', newRefreshToken);
        }
        processQueue(null, accessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        refreshAttempts = 0;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        await logout();
        refreshAttempts = 0;
        // Optionally show session expired message
        // Optionally redirect to login
        return Promise.reject(new Error('Session expired. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
