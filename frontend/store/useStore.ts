import { create } from 'zustand';

import * as authService from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Only used for theme persistence

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  themeMode: 'light' | 'dark';

  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  initializeTheme: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  themeMode: 'dark',


  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const result = await authService.login(email, password);
      set({ user: result.user, accessToken: result.token, isAuthenticated: !!result.token, isLoading: false });
    } catch (error: any) {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },


  signup: async (data: { name: string; email: string; password: string }) => {
    set({ isLoading: true });
    try {
      const result = await authService.signup(data);
      set({ user: result.user, accessToken: result.token, isAuthenticated: !!result.token, isLoading: false });
    } catch (error: any) {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },


  logout: async () => {
    try {
      await authService.logout();

      // Reset all store states to initial values
      const { usePropertiesStore } = await import('./usePropertiesStore');
      const { useMembersStore } = await import('./useMembersStore');
      const { useWizardStore } = await import('./useWizardStore');

      usePropertiesStore.getState().reset();
      useMembersStore.getState().reset();
      useWizardStore.getState().resetWizard();

      set({ user: null, accessToken: null, isAuthenticated: false });
    } catch (error) {
      // Optionally handle error
    }
  },

  toggleTheme: async () => {
    set((state) => {
      const newTheme = state.themeMode === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('themeMode', newTheme).catch(console.error);
      return { themeMode: newTheme };
    });
  },


  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const session = await authService.getStoredSession();
      if (session) {
        set({ user: session.user, accessToken: session.token, isAuthenticated: !!session.token, isLoading: false });
      } else {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },

  initializeTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        set({ themeMode: savedTheme });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  },
}));
