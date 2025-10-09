import client from './client';
import { Session } from '../types';

export const sessionsApi = {
  createSession: async (studentName: string, studentClass: string, studentPhoto?: string | null): Promise<Session> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `session-${Date.now()}`,
          studentName,
          studentClass,
          studentPhoto,
          profession: '',
          status: 'idle',
          createdAt: new Date(),
        });
      }, 500);
    });
  },

  stopSession: async (sessionId: string): Promise<void> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },

  getSessionStatus: async (sessionId: string): Promise<Session['status']> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const statuses: Session['status'][] = ['queued', 'processing', 'ready'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        resolve(randomStatus);
      }, 1000);
    });
  },

  getOutputs: async (sessionId: string): Promise<{ futureImageUrl?: string; finalVideoUrl?: string }> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          futureImageUrl: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=800',
          finalVideoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        });
      }, 1500);
    });
  },
};