import { requestJson } from './apiClient';
import { Property } from '@/types/property';

export type CreatePropertyInput = Omit<Property, 'id' | 'createdAt'> & {
    createdAt?: string;
};

export const propertiesApi = {
    getAll: () => requestJson<Property[]>('/properties', 'GET'),
    create: (payload: CreatePropertyInput) => requestJson<Property>('/properties', 'POST', payload),
    update: (id: string, updates: Partial<Property>) =>
        requestJson<Property>(`/properties/${id}`, 'PATCH', updates),
    remove: (id: string) => requestJson<void>(`/properties/${id}`, 'DELETE'),
};
