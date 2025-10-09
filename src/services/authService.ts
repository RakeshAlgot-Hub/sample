import axios, { AxiosError } from 'axios';
import { serviceBaseUrl } from '../constants/appConstants';

const apiClient = axios.create({
  baseURL: serviceBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json'
  },
  timeout: 10000
});

export const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};


export const Login = async (
  username: string,
  password: string
): Promise<{
  success: boolean;
  data?: {
    id: string;
    username: string;
    email: string;
    role: string;
    createdDate: string;
    keycloakId: string;
  };
  error?: string;
}> => {
  try {
    const response = await apiClient.post('/login', {
      username,
      password
    });

    const { code, result } = response.data;

    if (code === 1003 && result) {
      return {
        success: true,
        data: {
          id: result.id,
          username: result.username,
          email: result.email,
          createdDate: result.createdDate,
          keycloakId: result.keycloakId,
          role: result.role
        }
      };
    }

    return {
      success: false,
      error: response.data.message || 'Unexpected response format'
    };
  } catch (error) {
    return {
      success: false,
      error: (error as AxiosError<{ detail?: string }>).response?.data?.detail || (error as Error).message || 'Login failed'
    };
  }
};


// 🔑 Used only after login redirect to verify and store user data
export const verifyTokenForLoginService = async () => {
  const res = await axios.post(`${serviceBaseUrl}/verifyToken`, {});
  return res.data;
};

// 🔄 Used for periodic session checking (every 5s)
export const verifyTokenService = async () => {
  const res = await axios.post(`${serviceBaseUrl}/verifyToken`, {});
  return res.data;
};

export const logoutService = async (): Promise<any> => {
  try {
    const response = await axios.post(`${serviceBaseUrl}/logout`);
    return response.data.code;
  } catch (error) {
    throw error;
  }
};


export { apiClient };