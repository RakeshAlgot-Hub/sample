import axios from 'axios';
import { getSecureItem } from './secureStorage';
const API_URL = process.env.EXPO_PUBLIC_API_URL ;

async function authHeaders() {
  const token = await getSecureItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getPayments(memberId?: string) {
  const headers = await authHeaders();
  const params = memberId ? { memberId } : {};
  const res = await axios.get(`${API_URL}/payments`, { headers, params });
  return res.data;
}

export async function getPayment(id: string) {
  const headers = await authHeaders();
  const res = await axios.get(`${API_URL}/payments/${id}`, { headers });
  return res.data;
}

export async function createPayment(data: any) {
  const headers = await authHeaders();
  const { id, ...dataWithoutId } = data;
  const res = await axios.post(`${API_URL}/payments`, dataWithoutId, { headers });
  return res.data;
}

export async function updatePayment(id: string, data: any) {
  const headers = await authHeaders();
  const res = await axios.put(`${API_URL}/payments/${id}`, data, { headers });
  return res.data;
}

export async function deletePayment(id: string) {
  const headers = await authHeaders();
  const res = await axios.delete(`${API_URL}/payments/${id}`, { headers });
  return res.data;
}
