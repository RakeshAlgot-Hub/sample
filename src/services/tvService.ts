import { ApiResponse } from '../types/apiResponse';
import { apiClient } from './authService';

interface LatestContentData {
  futureImageUrl?: string;
  studentName?: string;
  studentClass?: string;
  profession?: string;
}

export const getLatestContent = async (): Promise<ApiResponse<LatestContentData>> => {
  try {
    const response = await apiClient.get('/tv/latest-content');
    
    return {
      result: response.data?.result || null,
      code: response.data?.code || 200,
      message: response.data?.message || 'Success'
    };
  } catch (error: any) {
    return {
      result: null,
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to get latest content'
    };
  }
};
