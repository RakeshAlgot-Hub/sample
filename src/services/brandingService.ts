import { ApiResponse } from '../types/apiResponse';
import { BrandingSettings, SchoolProfileRequest } from '../types/branding';
import { apiClient } from './authService';

export const createOrUpdateSchoolProfile = async (
  profile: SchoolProfileRequest | BrandingSettings // This can either be minimal or full
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.post('/schoolProfile', profile);
    return response.data;
  } catch (error: any) {
    return {
      result: null,
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to update school profile',
    };
  }
};

export const getBrandingSettings = async (): Promise<ApiResponse<BrandingSettings>> => {
  try {
    const response = await apiClient.get('/branding/settings');
    return response.data;
  } catch (error: any) {
    return {
      result: null,  // ✅ REQUIRED
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to fetch branding settings'
    };
  }
};

export const updateBrandingSettings = async (
  id: string,
  settings: BrandingSettings
): Promise<ApiResponse<BrandingSettings>> => {
  try {
    const response = await apiClient.put(
      `/branding/settings`,
      settings,
      {
        params: { id }, // ✅ sends ?id=xxxx in the URL
      }
    );
    return response.data;
  } catch (error: any) {
    return {
      result: null,
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to update branding settings',
    };
  }
};


export const uploadFile = async <T = string>(
  file: File
): Promise<ApiResponse<T>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      code: response.data.code,
      message: response.data.message,
      result: response.data.result as T,
    };
  } catch (error: any) {
    return {
      result: null as T | null,
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to upload file',
    };
  }
};

