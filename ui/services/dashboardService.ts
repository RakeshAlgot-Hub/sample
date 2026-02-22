

export interface DashboardStats {
  totalProperties: number;
  totalRooms: number;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  occupancyRate: number;
  totalTenants: number;
  totalRevenue: number;
}

export interface PropertyStats {
  id: string;
  name: string;
  type: string;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
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



import { getApi, handleApiError } from '@/lib/api';

export const dashboardService = {
  async getDashboardStats(propertyId: string): Promise<DashboardStats> {
    try {
      const api = getApi();
      const res = await api.get('/dashboard/stats', { params: { propertyId } });
      // The backend does not return totalProperties, so set it to 1 for single property context
      return { totalProperties: 1, ...res.data };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getPropertyStats(propertyId: string): Promise<PropertyStats[]> {
    try {
      const api = getApi();
      const res = await api.get('/dashboard/property-stats', { params: { propertyId } });
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getAllTenants(propertyId: string): Promise<TenantResponse[]> {
    try {
      const api = getApi();
      const res = await api.get('/dashboard/tenants', { params: { propertyId } });
      return res.data;
    } catch (error) {
      const apiError = handleApiError(error);
      // Stop repeated requests on 403/429
      if (apiError.statusCode === 403 || apiError.statusCode === 429) {
        throw { ...apiError, stopRetry: true };
      }
      throw apiError;
    }
  },
};
