import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Payment {
  id: string;
  memberId: string;
  propertyId: string;
  amount: number;
  paymentDate: string;
  status: 'paid' | 'due' | 'upcoming';
  cycle: number;
}

const PAGE_SIZE = 50;

export async function getPaymentsByProperty(propertyId: string, page = 1, pageSize = PAGE_SIZE): Promise<Payment[]> {
  const data = await AsyncStorage.getItem('payments_collection');
  const all: Payment[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((p) => p.propertyId === propertyId);
  const start = (page - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}

export async function getPaymentsByStatus(propertyId: string, status: Payment['status'], page = 1, pageSize = PAGE_SIZE): Promise<Payment[]> {
  const data = await AsyncStorage.getItem('payments_collection');
  const all: Payment[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((p) => p.propertyId === propertyId && p.status === status);
  const start = (page - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}

export async function savePayment(payment: Payment): Promise<void> {
  const data = await AsyncStorage.getItem('payments_collection');
  const all: Payment[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((p) => p.id === payment.id);
  if (idx >= 0) {
    all[idx] = payment;
  } else {
    all.push(payment);
  }
  await AsyncStorage.setItem('payments_collection', JSON.stringify(all));
}

export async function removePayment(id: string): Promise<void> {
  const data = await AsyncStorage.getItem('payments_collection');
  const all: Payment[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((p) => p.id !== id);
  await AsyncStorage.setItem('payments_collection', JSON.stringify(filtered));
}
