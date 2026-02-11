import axios from 'axios';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export async function getRooms() {
  const res = await axios.get(`${API_URL}/rooms`);
  return res.data;
}
export async function getRoom(id: string) {
  const res = await axios.get(`${API_URL}/rooms/${id}`);
  return res.data;
}
export async function createRoom(data: any) {
  const res = await axios.post(`${API_URL}/rooms`, data);
  return res.data;
}
export async function updateRoom(id: string, data: any) {
  const res = await axios.put(`${API_URL}/rooms/${id}`, data);
  return res.data;
}
export async function deleteRoom(id: string) {
  const res = await axios.delete(`${API_URL}/rooms/${id}`);
  return res.data;
}
