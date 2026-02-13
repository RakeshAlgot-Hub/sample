// utils/jwt.ts
// Utility to decode JWT and check expiry
export function decodeJwt(token: string) {
  if (!token) return null;
  const [, payload] = token.split('.');
  if (!payload) return null;
  try {
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function isTokenExpiringSoon(token: string, thresholdMinutes = 5) {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now < thresholdMinutes * 60;
}

export function isTokenExpired(token: string) {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}
