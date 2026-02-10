import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, User, TokenSet, LoginResponse } from '@/services/authApi'; // Import User, TokenSet, LoginResponse
import { tokenStorage } from '@/services/tokenStorage';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

interface DeviceMetaData {
  deviceId: string;
  platform: string;
  appVersion: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null; // User object now matches User interface
  themeMode: 'light' | 'dark';
  isLoading: boolean;
  deviceMetaData: DeviceMetaData | null;

  login: (email: string | undefined, phoneNumber: string | undefined, password: string, device: DeviceMetaData) => Promise<void>;
  signup: (fullName: string, email: string | undefined, phoneNumber: string | undefined, password: string, device: DeviceMetaData) => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  initializeTheme: () => Promise<void>;
  setDeviceMetaData: (data: DeviceMetaData) => void;
}

export const useStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  themeMode: 'dark',
  isLoading: true,
  deviceMetaData: null,

  setDeviceMetaData: (data: DeviceMetaData) => set({ deviceMetaData: data }),

  login: async (email, phoneNumber, password, device) => {
    try {
      const response: LoginResponse = await authApi.login(email, phoneNumber, password, device);
      const { accessToken, refreshToken, ...userData } = response; // Destructure tokens and user data
      await tokenStorage.setTokens(accessToken, refreshToken);
      set({ isAuthenticated: true, user: userData }); // Store user data
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  },

  signup: async (fullName, email, phoneNumber, password, device) => {
    try {
      const response: LoginResponse = await authApi.signup(fullName, email, phoneNumber, password, device);
      const { accessToken, refreshToken, ...userData } = response; // Destructure tokens and user data
      await tokenStorage.setTokens(accessToken, refreshToken);
      set({ isAuthenticated: true, user: userData }); // Store user data
    } catch (error) {
      console.error('Failed to signup:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const deviceId = get().deviceMetaData?.deviceId;
      if (deviceId) {
        await authApi.logout(deviceId).catch((err) => console.warn("Logout API failed (might be already logged out):", err));
      }
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
    set({ isLoading: true });
    try {
      // 1. Get device metadata
      let deviceId: string | null = null;
      if (Platform.OS === 'ios') {
        deviceId = await Application.getIosIdForVendorAsync();
      } else if (Platform.OS === 'android') {
        deviceId = await Application.getAndroidId();
      } else {
        deviceId = 'web-device-' + Math.random().toString(36).substring(2, 15);
      }

      if (!deviceId) {
        console.error("Failed to get device ID. Cannot initialize auth.");
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }
      const appVersion = Application.nativeApplicationVersion || 'unknown';
      const platform = Platform.OS;
      const device = { deviceId, platform, appVersion };
      get().setDeviceMetaData(device); // Store device metadata in state

      let accessToken = await tokenStorage.getAccessToken();
      let refreshToken = await tokenStorage.getRefreshToken();
      let currentUser: User | null = null;
      let newTokens: TokenSet | null = null;

      if (!accessToken && !refreshToken) {
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }

      // Try to get profile with current access token first
      if (accessToken) {
        try {
          currentUser = await authApi.getProfile();
          // If successful, accessToken is still valid. No new tokens from here.
          set({ isAuthenticated: true, user: currentUser, isLoading: false });
          return; // Auth initialized successfully
        } catch (error) {
          console.log("Access token possibly expired or invalid, attempting refresh if refreshToken available.");
          // If getProfile fails, it might be due to expired access token. Proceed to refresh.
          if (!(error instanceof Error && (error.message.includes('401') || error.message.includes('403')))) {
            // Not a 401/403, some other error, log out
            console.error('Failed to get profile with access token for unknown reason:', error);
            await tokenStorage.clearTokens();
            set({ isLoading: false, isAuthenticated: false, user: null });
            return;
          }
        }
      }

      // If access token was missing, or getProfile failed with 401/403, try to refresh
      if (refreshToken && deviceId) {
        try {
          newTokens = await authApi.refresh(refreshToken, deviceId);
          if (newTokens.accessToken) {
            await tokenStorage.setTokens(newTokens.accessToken, newTokens.refreshToken);
            // With new access token, fetch user profile again
            currentUser = await authApi.getProfile();
            set({ isAuthenticated: true, user: currentUser, isLoading: false });
            return; // Auth initialized successfully via refresh
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
        }
      }

      // If we reach here, either no tokens, refresh failed, or getProfile failed ultimately
      await tokenStorage.clearTokens();
      set({ isLoading: false, isAuthenticated: false, user: null });

    } catch (error) {
      console.error('Unhandled error during auth initialization:', error);
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

