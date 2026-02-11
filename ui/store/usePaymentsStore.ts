import { create } from 'zustand';
import * as paymentService from '@/services/paymentService';
import { Payment } from '@/types/payment';

interface PaymentsStore {
  payments: Payment[];
  addPayment: (payment: Payment) => Promise<void>;
  removePayment: (id: string) => Promise<void>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  loadPayments: () => Promise<void>;
  reset: () => void;
}

export const usePaymentsStore = create<PaymentsStore>((set, get) => ({
  payments: [],

  addPayment: async (payment: Payment) => {
    const created = await paymentService.createPayment(payment);
    set((state) => ({
      payments: [...state.payments, created as Payment],
    }));
  },

  removePayment: async (id: string) => {
    await paymentService.deletePayment(id);
    set((state) => ({
      payments: state.payments.filter((p) => p.id !== id),
    }));
  },

  updatePayment: async (id: string, updates: Partial<Payment>) => {
    const updated = await paymentService.updatePayment(id, updates);
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, ...(updated as object) } : p
      ),
    }));
  },

  loadPayments: async () => {
    try {
      const payments = await paymentService.getPayments();
      set({ payments: payments as Payment[] });
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  },

  reset: () => {
    set({ payments: [] });
  },
}));
