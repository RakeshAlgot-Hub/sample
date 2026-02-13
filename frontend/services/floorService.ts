import api from './api';

export interface FloorSummary {
  id: string;
  buildingId: string;
  propertyId: string;
  name: string;
  createdAt: string;
  totalRooms: number;
  totalBeds: number;
}

export async function createFloor(propertyId: string, buildingId: string, data: { name: string }) {
  const response = await api.post<FloorSummary>(`/properties/${propertyId}/buildings/${buildingId}/floors`, data);
  return response.data;
}

export async function updateFloor(propertyId: string, buildingId: string, floorId: string, data: { name?: string }) {
  const response = await api.patch<FloorSummary>(`/properties/${propertyId}/buildings/${buildingId}/floors/${floorId}`, data);
  return response.data;
}

export async function deleteFloor(propertyId: string, buildingId: string, floorId: string) {
  await api.delete(`/properties/${propertyId}/buildings/${buildingId}/floors/${floorId}`);
}

export async function getFloorSummaries(propertyId: string, buildingId: string): Promise<FloorSummary[]> {
  const response = await api.get<FloorSummary[]>(`/properties/${propertyId}/buildings/${buildingId}/floors`);
  return response.data;
}
