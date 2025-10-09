import { create } from 'zustand';
import { adminService } from '../services/adminService';
import type { SubscribedUser, AllUser, NotificationResponse, EmailRequest, AdminTabType } from '../types/admin';

interface AdminState {
    // State
    subscribedUsers: SubscribedUser[];
    allUsers: AllUser[];
    isLoading: boolean;
    error: string | null;
    activeTab: AdminTabType;

    // Actions
    setActiveTab: (tab: AdminTabType) => void;
    fetchAllUsers: () => Promise<void>;
    fetchSubscribedUsers: () => Promise<void>;
    sendNotificationToAll: (message: string) => Promise<NotificationResponse>;
    sendNotificationToUser: (recipientId: string, message: string) => Promise<NotificationResponse>;
    sendEmailToUser: (emailData: EmailRequest) => Promise<NotificationResponse>;
    clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
    // Initial state
    subscribedUsers: [],
    allUsers: [],
    isLoading: false,
    error: null,
    activeTab: 'sendEmail',

    setActiveTab: (tab: AdminTabType) => {
        set({ activeTab: tab });
    },

    fetchAllUsers: async () => {
        set({ isLoading: true, error: null });

        try {
            const users = await adminService.getAllUsers();
            set({ allUsers: users, isLoading: false });
        } catch (error) {
            const errorMessage = (error as Error).message || 'Failed to fetch all users';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },
    fetchSubscribedUsers: async () => {
        set({ isLoading: true, error: null });

        try {
            const users = await adminService.getSubscribedUsers();
            set({ subscribedUsers: users, isLoading: false });
        } catch (error) {
            const errorMessage = (error as Error).message || 'Failed to fetch subscribed users';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    sendNotificationToAll: async (message: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await adminService.sendNotificationToAll(message);
            set({ isLoading: false });
            return response;
        } catch (error) {
            const errorMessage = (error as Error).message || 'Failed to send notification';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    sendNotificationToUser: async (recipientId: string, message: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await adminService.sendNotificationToUser(recipientId, message);
            set({ isLoading: false });
            return response;
        } catch (error) {
            const errorMessage = (error as Error).message || 'Failed to send notification';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    sendEmailToUser: async (emailData: EmailRequest): Promise<NotificationResponse> => {
        set({ isLoading: true, error: null })
        try {
            const response = await adminService.sendEmail(emailData);
            if (response.code === 1051) {
                set({ isLoading: false });
            } else {
                const errorMessage = response.message || "Failed to send email";
                set({ error: errorMessage, isLoading: false });
            }
            return response;
        } catch (error) {
            const errorMessage = (error as Error).message || "Failed to send email";
            set({ error: errorMessage, isLoading: false });
            return { code: 1052, message: errorMessage };
        }
    },

    clearError: () => set({ error: null })
}));