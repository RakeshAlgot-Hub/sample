import axios from 'axios';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export async function getMembers() {
  const res = await axios.get(`${API_URL}/members`);
  return res.data;
}
export async function getMember(id: string) {
  const res = await axios.get(`${API_URL}/members/${id}`);
  return res.data;
}
export async function createMember(data: any) {
  const res = await axios.post(`${API_URL}/members`, data);
  return res.data;
}
export async function updateMember(id: string, data: any) {
  const res = await axios.put(`${API_URL}/members/${id}`, data);
  return res.data;
}
export async function deleteMember(id: string) {
  const res = await axios.delete(`${API_URL}/members/${id}`);
  return res.data;
}
