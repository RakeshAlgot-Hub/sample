
import { getApi, handleApiError } from '@/lib/api';

export interface CreateTenantRequest {
  propertyId: string;
  unitId: string;
  fullName: string;
  documentId: string;
  phoneNumber: string;
  checkInDate: string;
  depositAmount: string;
  status: string;
}

export interface TenantResponse {
  id: string;
  propertyId: string;
  unitId: string;
  fullName: string;
  documentId: string;
  phoneNumber: string;
  checkInDate: string;
  depositAmount: string;
  status: string;
}

export const tenantService = {
  async createTenant(data: CreateTenantRequest): Promise<TenantResponse> {
    try {
      const api = getApi();
      const response = await api.post<TenantResponse>('/tenants', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getTenantsByProperty(propertyId: string): Promise<TenantResponse[]> {
    try {
      const api = getApi();
      const response = await api.get<TenantResponse[]>('/tenants', { params: { propertyId } });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  async deleteTenant(tenantId: string): Promise<void> {
    try {
      const api = getApi();
      await api.delete(`/tenants/${tenantId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateTenant(tenantId: string, data: Partial<CreateTenantRequest>): Promise<TenantResponse> {
    try {
      const api = getApi();
      const response = await api.patch<TenantResponse>(`/tenants/${tenantId}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};