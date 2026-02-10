import axios from 'axios';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export async function getPayments() {
  const res = await axios.get(`${API_URL}/payments`);
  return res.data;
}
export async function getPayment(id: string) {
  const res = await axios.get(`${API_URL}/payments/${id}`);
  return res.data;
}
export async function createPayment(data: any) {
  const res = await axios.post(`${API_URL}/payments`, data);
  return res.data;
}
export async function updatePayment(id: string, data: any) {
  const res = await axios.put(`${API_URL}/payments/${id}`, data);
  return res.data;
}
export async function deletePayment(id: string) {
  const res = await axios.delete(`${API_URL}/payments/${id}`);
  return res.data;
}
