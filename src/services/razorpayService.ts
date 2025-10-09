import axios from 'axios';
import type { OrderResponse, VerificationResponse } from '../types/razorpayTypes';

export class RazorpayService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async createPaymentByRazorpay(orderData: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string> | string;
  }): Promise<OrderResponse> {
    try {
      // Ensure notes is always an object
      let parsedNotes: Record<string, string> = {};
      if (orderData.notes) {
        if (typeof orderData.notes === 'string' && orderData.notes.trim()) {
          try {
            parsedNotes = JSON.parse(orderData.notes);
            // Ensure parsed object has string values
            parsedNotes = Object.fromEntries(
              Object.entries(parsedNotes).map(([k, v]) => [k, String(v)])
            );
          } catch {
            parsedNotes = { note: orderData.notes };
          }
        } else if (typeof orderData.notes === 'object') {
          parsedNotes = Object.fromEntries(
            Object.entries(orderData.notes).map(([k, v]) => [k, String(v)])
          );
        }
      }

      const payload = {
        ...orderData,
        notes: parsedNotes
      };

      const response = await axios.post(`${this.baseUrl}/order`, payload, {
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
        error: response.data?.message || 'Failed to create order',
      };
    } catch (error: unknown) {
      console.error('Failed to create order:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Failed to create order',
        };
      }

      return {
        success: false,
        error: (error as Error).message || 'Failed to create order',
      };
    }
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<VerificationResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments/verify`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          withCredentials: true,
        }
      );
      return response.data.result || response.data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }

  async getOrderDetails(orderId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/orders/${orderId}`, {
        headers: { accept: 'application/json' },
        withCredentials: true,
      });
      return response.data.result || response.data;
    } catch (error) {
      console.error('Failed to get order details:', error);
      throw error;
    }
  }
}

// Export a factory function to create service instances
export const createRazorpayService = (backendUrl: string) => {
  return new RazorpayService(backendUrl);
};

// Export the service for backward compatibility
export const razorpayService = {
  createPaymentByRazorpay: (backendUrl: string) => (orderData: any) => 
    new RazorpayService(backendUrl).createPaymentByRazorpay(orderData),
  verifyPayment: (backendUrl: string) => (paymentData: any) => 
    new RazorpayService(backendUrl).verifyPayment(paymentData),
  getOrderDetails: (backendUrl: string) => (orderId: string) => 
    new RazorpayService(backendUrl).getOrderDetails(orderId),
};