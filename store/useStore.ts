import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  themeMode: 'light' | 'dark';
  isLoading: boolean;

  login: (user: User) => Promise<void>;
  signup: (user: User) => Promise<void>;
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

  login: async (user: User) => {
    try {
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ isAuthenticated: true, user });
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  },

  signup: async (user: User) => {
    try {
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ isAuthenticated: true, user });
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  },

  logout: async () => {
    try {
      // Clear all AsyncStorage data (properties, members, wizard data, etc.)
      await AsyncStorage.clear();

      // Reset all store states to initial values
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
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      const userString = await AsyncStorage.getItem('user');

      if (isAuthenticated === 'true' && userString) {
        const user = JSON.parse(userString);
        set({ isAuthenticated: true, user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isLoading: false });
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
