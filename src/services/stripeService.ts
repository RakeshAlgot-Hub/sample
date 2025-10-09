import axios from 'axios';
import type { PaymentIntentResponse, VerificationResponse } from '../types/stripeTypes';

export class StripeService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async createPaymentIntent(intentData: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string> | string;
  }): Promise<PaymentIntentResponse> {
    try {
      // Parse notes if it's a string
      let parsedNotes = intentData.notes;
      if (typeof intentData.notes === 'string' && intentData.notes.trim()) {
        try {
          parsedNotes = JSON.parse(intentData.notes);
        } catch {
          // If parsing fails, keep as string
          parsedNotes = { note: intentData.notes };
        }
      }

      const payload = {
        ...intentData,
        notes: parsedNotes
      };

      const response = await axios.post(`${this.baseUrl}/payment-intent/create`, payload, {
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          data: response.data.result || response.data,
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Failed to create payment intent',
      };
    } catch (error: unknown) {
      console.error('Failed to create payment intent:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Failed to create payment intent',
        };
      }

      return {
        success: false,
        error: (error as Error).message || 'Failed to create payment intent',
      };
    }
  }

  async verifyPaymentIntent(paymentIntentId: string): Promise<VerificationResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payment-intent/verify`,
        null,
        {
          params: { paymentIntentId },
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          data: response.data.result || response.data,
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Failed to verify payment intent',
      };
    } catch (error) {
      console.error('Payment intent verification failed:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Failed to verify payment intent',
        };
      }

      return {
        success: false,
        error: (error as Error).message || 'Failed to verify payment intent',
      };
    }
  }
}

// Export a factory function to create service instances
export const createStripeService = (backendUrl: string) => {
  return new StripeService(backendUrl);
};

// Export the service for backward compatibility
export const stripeService = {
  createPaymentIntent: (backendUrl: string) => (intentData: any) => 
    new StripeService(backendUrl).createPaymentIntent(intentData),
  verifyPaymentIntent: (backendUrl: string) => (paymentIntentId: string) => 
    new StripeService(backendUrl).verifyPaymentIntent(paymentIntentId),
};