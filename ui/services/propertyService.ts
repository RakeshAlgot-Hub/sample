
import axios from 'axios';
import { getSecureItem } from './secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

async function authHeaders() {
  const token = await getSecureItem('accessToken');
  console.log('Access token used for propertyService:', token);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getProperties() {
  const headers = await authHeaders();
  const res = await axios.get(`${API_URL}/properties`, { headers });
  return res.data;
}
export async function getProperty(id: string) {
  const headers = await authHeaders();
  const res = await axios.get(`${API_URL}/properties/${id}`, { headers });
  return res.data;
}
export async function createProperty(data: any) {
  const headers = await authHeaders();
  // Remove id field if present
  const { id, ...dataWithoutId } = data;
  const res = await axios.post(`${API_URL}/properties`, dataWithoutId, { headers });
  return res.data;
}
export async function updateProperty(id: string, data: any) {
  const headers = await authHeaders();
  const res = await axios.put(`${API_URL}/properties/${id}`, data, { headers });
  return res.data;
}
export async function deleteProperty(id: string) {
  const headers = await authHeaders();
  const res = await axios.delete(`${API_URL}/properties/${id}`, { headers });
  return res.data;
}
