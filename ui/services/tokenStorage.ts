import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

export const tokenStorage = {
    getAccessToken: async (): Promise<string | null> => {
        const useSecureStore = await SecureStore.isAvailableAsync();
        if (useSecureStore) {
            return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        }
        return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    },
    getRefreshToken: async (): Promise<string | null> => {
        const useSecureStore = await SecureStore.isAvailableAsync();
        if (useSecureStore) {
            return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        }
        return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    },
    setTokens: async (accessToken: string, refreshToken?: string | null) => {
        const useSecureStore = await SecureStore.isAvailableAsync();
        if (useSecureStore) {
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
            if (refreshToken) {
                await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
            } else {
                await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            }
            return;
        }

        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        } else {
            await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        }
    },
    clearTokens: async () => {
        const useSecureStore = await SecureStore.isAvailableAsync();
        if (useSecureStore) {
            await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            return;
        }

        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};
