import client from './client';

export const mediaApi = {
  getPresignedUrl: async (filename: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uploadUrl: `https://mock-upload-url.com/${filename}`,
          fileKey: `uploads/${Date.now()}-${filename}`,
        });
      }, 500);
    });
  },

  commitUpload: async (fileKey: string): Promise<{ mediaUrl: string }> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          mediaUrl: `https://cdn.futureframe.com/${fileKey}`,
        });
      }, 800);
    });
  },
};