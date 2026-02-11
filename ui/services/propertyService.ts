import axios from 'axios';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export async function getProperties() {
  const res = await axios.get(`${API_URL}/properties`);
  return res.data;
}
export async function getProperty(id: string) {
  const res = await axios.get(`${API_URL}/properties/${id}`);
  return res.data;
}
export async function createProperty(data: any) {
  const res = await axios.post(`${API_URL}/properties`, data);
  return res.data;
}
export async function updateProperty(id: string, data: any) {
  const res = await axios.put(`${API_URL}/properties/${id}`, data);
  return res.data;
}
export async function deleteProperty(id: string) {
  const res = await axios.delete(`${API_URL}/properties/${id}`);
  return res.data;
}
