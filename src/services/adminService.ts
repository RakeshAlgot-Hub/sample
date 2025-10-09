import axios from 'axios';
import { serviceBaseUrl } from '../constants/appConstants';
import type { SubscribedUser, AllUser, NotificationResponse, EmailRequest } from '../types/admin';

export class AdminService {
  private baseUrl: string;

  constructor(baseUrl: string = serviceBaseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  // Get all users
async getAllUsers(): Promise<AllUser[]> {
  try {
    const response = await axios.get(
      `${this.baseUrl}/users`,
      {
        headers: { 'accept': 'application/json' },
        withCredentials: true
      }
    );
    return Array.isArray(response.data.result) ? response.data.result : [];
  } catch (error) {
    console.error('Failed to get all users:', error);
    throw error;
  }
}


  // Get all subscribed users
  async getSubscribedUsers(): Promise<SubscribedUser[]> {
  try {
    const response = await axios.get(`${this.baseUrl}/subscribedUsers`, {
      headers: { 'accept': 'application/json' },
      withCredentials: true
    });

    const result = response.data?.result;

    // Ensure always an array
    if (Array.isArray(result)) {
      return result;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Failed to get subscribed users:', error);
    return []; // always return array on failure
  }
}


  // Send push notification to all users
  async sendNotificationToAll(message: string): Promise<NotificationResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/sendNotifications`,
        null,
        {
          params: { message },
          headers: {
            'accept': 'application/json'
          },
          withCredentials: true
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to send notification to all:', error);
      throw error;
    }
  }

  // Send push notification to specific user
  async sendNotificationToUser(recipientId: string, message: string): Promise<NotificationResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/sendNotification`,
        null,
        {
          params: { recipientId, message },
          headers: {
            'accept': 'application/json'
          },
          withCredentials: true
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to send notification to user:', error);
      throw error;
    }
  }

  // Send email to specific user
  async sendEmail(emailData: EmailRequest): Promise<NotificationResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/email/sendEmail`,
        emailData,
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();