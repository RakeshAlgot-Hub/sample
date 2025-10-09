import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Login, logoutService, verifyTokenForLoginService, verifyTokenService } from '../services/authService'; // Removed: registerUser
import { User } from '../types/auth';
import { serviceBaseUrl } from '../constants/appConstants';

interface AuthState {
    isLoading: boolean;
    username: string | null;
    email: string | null;
    isLoggedIn: boolean;
    error: string | null;
    authState: "notChecked" | "checking" | "valid" | "invalid";
    isAuthenticated: boolean;
    user: User | null;
    backendUrl: string;
    loginWithProvider: (provider: string) => void;
    verifyTokenAfterLogin: () => Promise<void>;
    verifySessionPeriodically: () => Promise<void>;
    Login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: () => void;
    clearError: () => void;
    logout: () => void;
    setBackendUrl: (url: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            discountCodes: [],
            isLoading: false,
            error: null,
            authState: "notChecked",
            isAuthenticated: false,
            user: null,
            username: null,
            email: null,
            isLoggedIn: true,
            backendUrl: '',

            setBackendUrl: (url: string) => {
                set({ backendUrl: url });
            },

            loginWithProvider: (provider: string) => {
                const { backendUrl: storeBackendUrl } = get();
                let backendUrl = storeBackendUrl || serviceBaseUrl;

                if (!backendUrl) {
                    console.error('Backend URL not available');
                    return;
                }

                // 🔥 Remove trailing slash if it exists
                backendUrl = backendUrl.replace(/\/+$/, '');

                set({ isLoading: true });
                try {
                    const redirectUrl = `${backendUrl}/auth/provider?provider=${provider}`;
                    window.location.href = redirectUrl;
                    set({ isLoading: false });
                } catch (error) {
                    console.error("Error during login redirection:", error);
                    set({ isLoading: false });
                }
            },

            loginWithGoogle: () => {
                const { loginWithProvider } = get();
                loginWithProvider('google');
            },

            Login: async (username: string, password: string) => {
                set({ isLoading: true, error: null, authState: "checking" });

                try {
                    const result = await Login(username, password);

                    if (result.success && result.data) {
                        const user: User = result.data;

                        set({
                            authState: "valid",
                            isLoading: false,
                            isAuthenticated: true,
                            isLoggedIn: true,
                            user,
                            username: user.username,
                            email: user.email,
                        });
                        return { success: true };
                    } else {
                        const errorMsg = result.error || "Invalid credentials. Please try again!";
                        set({
                            isLoading: false,
                            authState: "invalid",
                            isAuthenticated: false,
                            isLoggedIn: false,
                            user: null,
                            username: null,
                            email: null,
                            error: errorMsg,
                        });
                        return { success: false, error: errorMsg }; // ✅ return the message
                    }
                } catch (error) {
                    const errorMsg = (error as Error).message || "Login failed";
                    set({
                        error: errorMsg,
                        isLoading: false,
                        authState: "invalid",
                        isAuthenticated: false,
                        isLoggedIn: false,
                        user: null,
                        username: null,
                        email: null,
                    });
                    return { success: false, error: errorMsg }; // ✅ return the message
                }
            },

            verifyTokenAfterLogin: async () => {
                try {
                    set({ isLoading: true, authState: "checking" });
                    const data = await verifyTokenForLoginService();

                    if (data?.code === 1040 && data?.result) {
                        const user: User = data.result;

                        set({
                            user,
                            username: user.username,
                            email: user.email,
                            isLoading: false,
                            authState: "valid",
                            isAuthenticated: true,
                            isLoggedIn: true,
                        });
                    } else {
                        set({
                            user: null,
                            username: null,
                            email: null,
                            isLoading: false,
                            authState: "invalid",
                            isAuthenticated: false,
                            isLoggedIn: false,
                        });
                    }
                } catch (error) {
                    console.error("Error verifying token after login:", error);
                    set({
                        user: null,
                        username: null,
                        email: null,
                        isLoading: false,
                        authState: "invalid",
                        isAuthenticated: false,
                        isLoggedIn: false,
                    });
                }
            },


            verifySessionPeriodically: async () => {
                const currentUser = get().user;
                if (!currentUser) return;

                try {
                    const data = await verifyTokenService();
                    if (data.code !== 1040) {
                        get().logout();
                    }
                } catch (error) {
                    console.error("Error in periodic session verification:", error);
                    get().logout();
                }
            },

            clearError: () => {
                set({ error: null });
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    const responseCode = await logoutService();
                    if (responseCode === 1005) {
                        set({
                            isAuthenticated: false,
                            user: null,
                            isLoggedIn: false,
                            isLoading: false,
                            authState: "invalid"
                        });
                    } else {
                        set({ authState: "invalid", isLoading: false });
                    }
                } catch (error) {
                    set({ authState: "invalid", isLoading: false });
                } finally {
                    useAuthStore.persist.clearStorage();
                    sessionStorage.clear();
                    localStorage.clear();
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
            }),
        }
    )
);