import { create } from 'zustand';
import { getLatestContent } from '../services/tvService';
import { TVState } from '../types';

interface TVStore extends TVState {
  pollLatest: () => Promise<void>;
  setLatest: (futureImageUrl?: string, studentName?: string, studentClass?: string, profession?: string) => void;
  setStatus: (status: TVState['status']) => void;
}

export const useTVStore = create<TVStore>((set, get) => ({
  latestFutureImageUrl: undefined,
  studentName: undefined,
  studentClass: undefined,
  profession: undefined,
  status: 'waiting',

  pollLatest: async () => {
    try {
      const response = await getLatestContent();
      
      if (response.code === 200 && response.result) {
        const { futureImageUrl, studentName, studentClass, profession } = response.result;
        
        set({
          latestFutureImageUrl: futureImageUrl,
          studentName,
          studentClass,
          profession,
          status: studentName ? 'playing' : 'waiting'
        });
      } else {
        set({ status: 'waiting' });
      }
    } catch (error) {
      console.error('Error polling latest content:', error);
      set({ status: 'waiting' });
    }
  },

  setLatest: (futureImageUrl?: string, studentName?: string, studentClass?: string, profession?: string) => {
    set({
      latestFutureImageUrl: futureImageUrl,
      studentName,
      studentClass,
      profession,
      status: studentName ? 'playing' : 'waiting'
    });
  },

  setStatus: (status: TVState['status']) => {
    set({ status });
  },
}));