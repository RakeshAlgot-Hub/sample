import { getApi, handleApiError } from '@/lib/api';

export interface UpdateUnitRequest {
  status?: 'available' | 'occupied';
  currentTenantId?: string;
}

export const updateUnit = async (unitId: string, data: UpdateUnitRequest): Promise<void> => {
  try {
    const api = getApi();
    await api.put(`/units/${unitId}`, data);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Add to unitService
export const unitService = {
  // ...existing methods
};
