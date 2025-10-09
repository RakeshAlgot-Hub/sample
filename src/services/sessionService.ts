import { ApiResponse } from "../types/apiResponse";
import { Session } from "../types/session";
import { apiClient } from "./authService";

export const createSession = async (
  studentName: string,
  studentClass: string,
  profession: string,
  schoolId: string,
  studentImageId: string,
): Promise<ApiResponse<Session>> => {
  try {
    const response = await apiClient.post('/sessions', {
      studentName,
      studentClass,
      profession,
      schoolId,
      studentImageId
    });
    return response.data;
  } catch (error: any) {
    return {
      result: null,
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to create session'
    };
  }
};

export const getSessionStatus = async (
  sessionId: string
): Promise<ApiResponse<{ status: Session['status'] }>> => {
  try {
    const response = await apiClient.get(`/sessions/${sessionId}/status`);
    return response.data;
  } catch (error: any) {
    return {
      result: null,  // ✅ Add this
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to get session status'
    };
  }
};

export const getSessionOutputs = async (
  sessionId: string
): Promise<ApiResponse<{ futureImageUrl?: string; finalVideoUrl?: string }>> => {
  try {
    const response = await apiClient.get(`/sessions/${sessionId}/outputs`);
    return response.data;
  } catch (error: any) {
    return {
      result: null,  // ✅ Add this
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to get session outputs'
    };
  }
};

interface FinalVideoRequest {
  sessionId: string;
  schoolId: string;
  inputs: {
    teacherVideoUrl: string;
    futureImageUrl: string;
  };
  branding: {
    logoUrl: string;
    tagline: string;
  };
}

export const startFinalVideo = async (
  sessionId: string,
  schoolId: string,
  teacherVideoUrl: string,
  futureImageUrl: string,
  logoUrl: string,
  tagline: string
): Promise<ApiResponse<{ status: string; executionId: string | null }>> => {
  try {
    const payload: FinalVideoRequest = {
      sessionId,
      schoolId,
      inputs: {
        teacherVideoUrl,
        futureImageUrl
      },
      branding: {
        logoUrl,
        tagline
      }
    };

    const response = await apiClient.post('/startFinalVideo', payload);
    return response.data;
  } catch (error: any) {
    return {
      result: null,
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to start final video generation'
    };
  }
};

export const getAllSessions = async (schoolId: string): Promise<ApiResponse<Session[]>> => {
  try {
    const response = await apiClient.get(`/sessions?schoolId=${schoolId}`);
    return response.data;
  } catch (error: any) {
    return {
      result: null,
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to fetch sessions'
    };
  }
};
