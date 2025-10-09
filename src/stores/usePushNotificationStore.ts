import { create } from 'zustand';
import { pushNotificationService } from '../services/pushNotificationService';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  subscribe: (publicKey: string) => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  clearError: () => void;
}

export const usePushNotificationStore = create<PushNotificationState>((set, get) => ({
  isSupported: pushNotificationService.isSupported(),
  permission: 'default',
  isSubscribed: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await pushNotificationService.registerServiceWorker();
      const permission = await pushNotificationService.requestNotificationPermission();
      const subscription = pushNotificationService.getSubscription();
      
      set({
        permission,
        isSubscribed: !!subscription,
        isLoading: false
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false
      });
    }
  },

  subscribe: async (publicKey: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const subscription = await pushNotificationService.subscribeToPush(publicKey);
      if (subscription) {
        const success = await pushNotificationService.sendSubscriptionToServer(subscription);
        if (success) {
          set({
            isSubscribed: true,
            permission: 'granted',
            isLoading: false
          });
          return true;
        } else {
          throw new Error('Failed to register subscription with server');
        }
      } else {
        throw new Error('Failed to create push subscription');
      }
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false
      });
      return false;
    }
  },

  unsubscribe: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const success = await pushNotificationService.unsubscribeFromPush();
      if (success) {
        set({
          isSubscribed: false,
          permission: 'default',
          isLoading: false
        });
        return true;
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false
      });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));