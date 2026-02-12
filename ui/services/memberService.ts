import axios from 'axios';
import { getSecureItem } from './secureStorage';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function authHeaders() {
  const token = await getSecureItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMembers() {
  const headers = await authHeaders();
  const res = await axios.get(`${API_URL}/members`, { headers });
  return res.data;
}
export async function getMember(id: string) {
  const headers = await authHeaders();
  const res = await axios.get(`${API_URL}/members/${id}`, { headers });
  return res.data;
}
export async function createMember(data: any) {
  const headers = await authHeaders();
  // Remove id field if present
  const { id, ...dataWithoutId } = data;
  const res = await axios.post(`${API_URL}/members`, dataWithoutId, { headers });
  return res.data;
}
export async function updateMember(id: string, data: any) {
  const headers = await authHeaders();
  const res = await axios.put(`${API_URL}/members/${id}`, data, { headers });
  return res.data;
}
export async function deleteMember(id: string) {
  const headers = await authHeaders();
  const res = await axios.delete(`${API_URL}/members/${id}`, { headers });
  return res.data;
}
