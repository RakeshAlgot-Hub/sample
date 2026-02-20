import { create } from 'zustand';
import { userService, User, AuthResponse } from '@/services/userService';
import { initializeApi } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    initializeApi();
    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      set({ user, isInitialized: true });
    } catch (error) {
      console.log('No authenticated user found');
      set({ isInitialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await userService.login({ email, password });
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      set({ user: response.user, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await userService.register({
        email,
        password,
        name,
      });
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      set({ user: response.user, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await userService.logout();
      await AsyncStorage.removeItem('user');
      // Clear property, room, and unit stores
      const propertyStore = require('@/store/property');
      const roomStore = require('@/store/rooms');
      const unitStore = require('@/store/units');
      propertyStore.usePropertyStore.getState().clear();
      roomStore.useRoomStore.getState().clear();
      unitStore.useUnitStore.getState().clear();
      set({ user: null, isLoading: false });
    } catch (error) {
      console.error('Logout error:', error);
      await AsyncStorage.removeItem('user');
      // Clear property, room, and unit stores
      const propertyStore = require('@/store/property');
      const roomStore = require('@/store/rooms');
      const unitStore = require('@/store/units');
      propertyStore.usePropertyStore.getState().clear();
      roomStore.useRoomStore.getState().clear();
      unitStore.useUnitStore.getState().clear();
      set({ user: null, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
