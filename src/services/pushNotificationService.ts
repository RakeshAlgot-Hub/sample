import axios from 'axios';
import { serviceBaseUrl } from '../constants/appConstants';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: globalThis.PushSubscription | null = null;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribeToPush(publicKey: string): Promise<globalThis.PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    try {
      // Check for existing subscription
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
        return existingSubscription;
      }

      // Create new subscription
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      return this.subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  async sendSubscriptionToServer(subscription: globalThis.PushSubscription): Promise<boolean> {
    try {
      const subscriptionData: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      const response = await axios.post(`${serviceBaseUrl}/subscribe`, subscriptionData, {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        withCredentials: true
      });

      return response.data.code === 1100;
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      return false;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (this.subscription) {
        const subscriptionData: PushSubscription = {
          endpoint: this.subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(this.subscription.getKey('auth')!)
          }
        };

        // Unsubscribe from server
        await axios.post(`${serviceBaseUrl}/unsubscribe`, subscriptionData, {
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          withCredentials: true
        });

        // Unsubscribe from browser
        await this.subscription.unsubscribe();
        this.subscription = null;
      }

      // Reset browser notification permission by unregistering service worker
      await this.resetNotificationPermission();

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  private async resetNotificationPermission(): Promise<void> {
    try {
      // Unregister all service workers for this origin
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      // Clear the registration reference
      this.registration = null;
      
      // Note: Browser permission cannot be programmatically reset to 'default'
      // The user will need to manually reset it in browser settings
      // But unregistering service workers helps ensure clean re-subscription
    } catch (error) {
      console.error('Failed to reset notification permission:', error);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  getSubscription(): globalThis.PushSubscription | null {
    return this.subscription;
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();