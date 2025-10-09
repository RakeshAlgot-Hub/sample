import { ApiResponse } from "../types/apiResponse";
import { apiClient } from "./authService";

export interface Job {
  id: string;
  sessionId: string;
  imageUrl: string;
  profession: string;
  createdAt: string;
  updatedAt: string;
  status: 'queued' | 'processing' | 'success' | 'failed';
  isDeleted: boolean;
  outputs: Record<string, any>;
  executionId: string;
}

export const createJob = async (
  sessionId: string,
  imageUrl: string,
  profession: string
): Promise<ApiResponse<Job>> => {
  try {
    const response = await apiClient.post('/jobs', {
      sessionId,
      imageUrl,
      profession
    });
    return response.data;
  } catch (error: any) {
    return {
      result: null,
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to create job'
    };
  }
};

export const getJobStatus = async (
  jobId: string
): Promise<ApiResponse<Job>> => {
  try {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error: any) {
    return {
      result: null,
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to get job status'
    };
  }
};
