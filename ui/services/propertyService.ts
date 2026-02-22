import { getApi, handleApiError } from '@/lib/api';

export interface Building {
  id: string;
  name: string;
}
export interface Floor {
  id: string;
  name: string;
}
export interface CreatePropertyRequest {
  name: string;
  type: 'Hostel' | 'Apartment';
  city: string;
  address: string;
  buildings: Building[];
  shareTypes?: number[];
}

export interface PropertyResponse {
  id: string;
  name: string;
  type: 'Hostel' | 'Apartment';
  city: string;
  address: string;
  buildings: Building[];
  floors: Floor[];
  shareTypes: number[];
  createdAt: string;
  updatedAt: string;
}

export const propertyService = {
  async createProperty(data: CreatePropertyRequest): Promise<{ property: PropertyResponse, status: number }> {
    try {
      const api = getApi();
      // Attach ownerId from auth store if not present
      const { user } = require('@/store/auth').useAuthStore.getState();
      const payload = { ...data, ownerId: data['ownerId'] || (user ? user.id : undefined) };
      const response = await api.post<PropertyResponse>('/properties/', payload);
      return { property: response.data, status: response.status };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getProperties(): Promise<PropertyResponse[]> {
    try {
      const api = getApi();
      const response = await api.get<PropertyResponse[]>('/properties');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getProperty(propertyName: string): Promise<PropertyResponse> {
    try {
      const api = getApi();
      const response = await api.get<PropertyResponse>(`/properties/${propertyName}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateProperty(
    id: string,
    data: Partial<CreatePropertyRequest>
  ): Promise<PropertyResponse> {
    try {
      const api = getApi();
      const response = await api.put<PropertyResponse>(`/properties/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteProperty(id: string): Promise<void> {
    try {
      const api = getApi();
      await api.delete(`/properties/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async addFloor(propertyId: string, floor: string): Promise<PropertyResponse> {
    try {
      const api = getApi();
      const response = await api.post<PropertyResponse>(
        `/properties/${propertyId}/floors`,
        { floor }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async addShareType(propertyId: string, shareType: number): Promise<PropertyResponse> {
    try {
      const api = getApi();
      const response = await api.post<PropertyResponse>(
        `/properties/${propertyId}/share-types`,
        { shareType }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
