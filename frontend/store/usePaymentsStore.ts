import { create } from 'zustand';
import type { Payment } from '@/utils/paymentsRepository';
import { getPaymentsByProperty, getPaymentsByStatus } from '@/utils/paymentsRepository';

interface PaymentsStore {
  payments: Payment[];
  loadPaymentsByProperty: (propertyId: string, page?: number) => Promise<void>;
  loadPaymentsByStatus: (propertyId: string, status: Payment['status'], page?: number) => Promise<void>;
  clearPayments: () => void;
}

export const usePaymentsStore = create<PaymentsStore>((set) => ({
  payments: [],

  loadPaymentsByProperty: async (propertyId, page = 1) => {
    const payments = await getPaymentsByProperty(propertyId, page);
    set({ payments });
  },

  loadPaymentsByStatus: async (propertyId, status, page = 1) => {
    const payments = await getPaymentsByStatus(propertyId, status, page);
    set({ payments });
  },

  clearPayments: () => {
    set({ payments: [] });
  },
}));
