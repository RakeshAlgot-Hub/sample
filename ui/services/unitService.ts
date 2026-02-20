import { getApi, handleApiError } from '@/lib/api';

export interface CreateUnitsRequest {
  roomId: string;
  propertyId: string;
  buildingId: string;
  floorId: string;
  noOfBeds: number;
}

export interface UnitResponse {
  id: string;
  roomId: string;
  propertyId: string;
  buildingId: string;
  floorId: string;
  bedNumber: number;
  status: 'available' | 'occupied';
  createdAt: string;
  updatedAt: string;
}

export const unitService = {
  async createUnits(data: CreateUnitsRequest): Promise<UnitResponse[]> {
    try {
      const api = getApi();
      const response = await api.post<UnitResponse[]>('/units/bulk', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getUnits(propertyId: string): Promise<UnitResponse[]> {
    try {
      const api = getApi();
      const response = await api.get<UnitResponse[]>('/units', {
        params: { propertyId },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteUnitsByRoom(roomId: string): Promise<void> {
    try {
      const api = getApi();
      await api.delete(`/units/byRoom/${roomId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateUnit(unitId: string, data: { status?: 'available' | 'occupied'; currentTenantId?: string }): Promise<void> {
    try {
      const api = getApi();
      await api.put(`/units/${unitId}`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
