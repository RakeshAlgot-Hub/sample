import { getItem, deleteItem } from './secureStore';
import { clearAccessToken } from './tokenMemory';

const REFRESH_TOKEN_KEY = 'refresh_token';
const AUTH_USER_KEY = 'auth_user';

export async function getRefreshToken() {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function logout() {
  clearAccessToken();
  await deleteItem(REFRESH_TOKEN_KEY);
  await deleteItem(AUTH_USER_KEY);
}