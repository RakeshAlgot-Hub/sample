// Auth service for backend integration
// Replace mockData usage in UI with these functions

import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function loginUser(email: string, password: string) {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
}

export async function signupUser(name: string, email: string, password: string) {
  const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
  return response.data;
}
