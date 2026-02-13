import api from './api';
import { saveItem, getItem, deleteItem } from './secureStore';
import { setAccessToken,  clearAccessToken } from './tokenMemory';

const REFRESH_TOKEN_KEY = 'refresh_token';
const AUTH_USER_KEY = 'auth_user';

export async function login(email: string, password: string) {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data;
    setAccessToken(accessToken);
    if (refreshToken) await saveItem(REFRESH_TOKEN_KEY, refreshToken);
    await saveItem(AUTH_USER_KEY, JSON.stringify(user));
    return { user, token: accessToken, refreshToken };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
}

export async function signup(data: { name: string; email: string; password: string }) {
  try {
    const response = await api.post('/auth/signup', data);
    // Axios may treat 201 as error, so check status
      if (response.status === 201 || response.status === 200) {
        const { user, accessToken, refreshToken } = response.data;
        console.log('accesstoken:', accessToken);
        setAccessToken(accessToken);
        if (refreshToken) await saveItem(REFRESH_TOKEN_KEY, refreshToken);
        console.log('refreshToken:', refreshToken);
        await saveItem(AUTH_USER_KEY, JSON.stringify(user));
        return { user, token: accessToken, refreshToken };
      } else {
        throw new Error(response.data?.message || 'Signup failed');
      }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Signup failed');
  }
}

export async function logout() {
  clearAccessToken();
  await deleteItem(REFRESH_TOKEN_KEY);
  await deleteItem(AUTH_USER_KEY);
}

export async function getStoredSession() {
  // On app start, get refreshToken and user from SecureStore
  const refreshToken = await getItem(REFRESH_TOKEN_KEY);
  const userStr = await getItem(AUTH_USER_KEY);
  if (refreshToken && userStr) {
    // Try to refresh access token
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, user } = response.data;
      setAccessToken(accessToken);
      return { user, token: accessToken };
    } catch {
      await logout();
      return null;
    }
  }
  await logout();
  return null;
}

export async function getRefreshToken() {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function getUserFromStore() {
  const userStr = await getItem(AUTH_USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
