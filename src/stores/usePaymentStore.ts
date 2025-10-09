import { create } from 'zustand';
import { createStripeService } from '../services/stripeService';
import { createRazorpayService } from '../services/razorpayService';
import type { PaymentIntentData, PaymentResult } from '../types/stripeTypes';
import type { PaymentFormData, PaymentResponse } from '../types/razorpayTypes';
import { serviceBaseUrl } from '../constants/appConstants';

interface PaymentState {
  isLoading: boolean;
  error: string | null;
  lastPaymentResult: PaymentResult | null;
  lastRazorpayResponse: PaymentResponse | null;
  
  // Stripe methods
  createStripePayment: (data: PaymentIntentData) => Promise<{
    paymentIntentId: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: string;
  }>;
  verifyStripePayment: (paymentIntentId: string) => Promise<PaymentResult>;
  
  // Razorpay methods
  createRazorpayOrder: (data: PaymentFormData) => Promise<{
    orderId: string;
    amount: number;
    currency: string;
  }>;
  verifyRazorpayPayment: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => Promise<{ status: 'success' | 'failed'; message?: string }>;
  
  // Utility methods
  clearError: () => void;
  clearResults: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  isLoading: false,
  error: null,
  lastPaymentResult: null,
  lastRazorpayResponse: null,

  createStripePayment: async (data: PaymentIntentData) => {
    set({ isLoading: true, error: null });
    
    try {
      const backendUrl = serviceBaseUrl || '/api';
      const stripeService = createStripeService(backendUrl);
      
      const response = await stripeService.createPaymentIntent(data);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create payment intent');
      }
      
      set({ isLoading: false });
      
      return {
        paymentIntentId: response.data.paymentIntentId,
        clientSecret: response.data.clientSecret,
        amount: response.data.amount,
        currency: response.data.currency,
        status: response.data.status,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  verifyStripePayment: async (paymentIntentId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const backendUrl = serviceBaseUrl || '/api';
      const stripeService = createStripeService(backendUrl);
      
      const response = await stripeService.verifyPaymentIntent(paymentIntentId);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to verify payment');
      }
      
      const result: PaymentResult = {
        code: 1802,
        message: 'Payment verified successfully',
        result: {
          paymentIntentId: response.data.paymentIntentId,
          status: response.data.status as 'succeeded' | 'failed' | 'requires_payment_method' | 'canceled',
          amount: response.data.amount,
          currency: response.data.currency,
          metadata: response.data.metadata,
          paymentMethodTypes: response.data.paymentMethodTypes,
        }
      };
      
      set({ isLoading: false, lastPaymentResult: result });
      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  createRazorpayOrder: async (data: PaymentFormData) => {
    set({ isLoading: true, error: null });
    
    try {
      const backendUrl = serviceBaseUrl || '/api';
      console.log("backendUrl", backendUrl)
      const razorpayService = createRazorpayService(backendUrl);
      
      const response = await razorpayService.createPaymentByRazorpay({
        amount: data.amount, 
        currency: data.currency,
        receipt: data.receipt,
        notes: data.notes,
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create order');
      }
      
      set({ isLoading: false });
      
      return {
        orderId: response.data.orderId,
        amount: response.data.amount,
        currency: response.data.currency,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  verifyRazorpayPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    set({ isLoading: true, error: null });
    
    try {
      const backendUrl = serviceBaseUrl || '/api';
      const razorpayService = createRazorpayService(backendUrl);
      
      const response = await razorpayService.verifyPayment(paymentData);
      
      set({ 
        isLoading: false, 
        lastRazorpayResponse: paymentData as PaymentResponse 
      });
      
      return response;
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearResults: () => set({ lastPaymentResult: null, lastRazorpayResponse: null }),
}));