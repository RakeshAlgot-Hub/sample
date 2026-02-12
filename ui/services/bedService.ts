import axios from 'axios';
const API_URL = process.env.EXPO_PUBLIC_API_URL;
export async function getBeds() {
  const res = await axios.get(`${API_URL}/beds`);
  return res.data;
}
export async function getBed(id: string) {
  const res = await axios.get(`${API_URL}/beds/${id}`);
  return res.data;
}
export async function createBed(data: any) {
  const res = await axios.post(`${API_URL}/beds`, data);
  return res.data;
}
export async function updateBed(id: string, data: any) {
  const res = await axios.put(`${API_URL}/beds/${id}`, data);
  return res.data;
}
export async function deleteBed(id: string) {
  const res = await axios.delete(`${API_URL}/beds/${id}`);
  return res.data;
}
