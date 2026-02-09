import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/services/authApi';
import { tokenStorage } from '@/services/tokenStorage';
import { User } from '@/types/user';

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  themeMode: 'light' | 'dark';
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  initializeTheme: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  themeMode: 'dark',
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);
      set({ isAuthenticated: true, user: response.user });
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.signup(name, email, password);
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);
      set({ isAuthenticated: true, user: response.user });
    } catch (error) {
      console.error('Failed to signup:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout().catch(() => undefined);
      await tokenStorage.clearTokens();

      const { usePropertiesStore } = await import('./usePropertiesStore');
      const { useMembersStore } = await import('./useMembersStore');
      const { useWizardStore } = await import('./useWizardStore');

      usePropertiesStore.getState().reset();
      useMembersStore.getState().reset();
      useWizardStore.getState().resetWizard();

      set({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error('Failed to clear auth state:', error);
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
    try {
      const accessToken = await tokenStorage.getAccessToken();
      if (!accessToken) {
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }

      const user = await authApi.getProfile();
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      await tokenStorage.clearTokens();
      set({ isLoading: false, isAuthenticated: false, user: null });
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
