import api from './api';

export interface BuildingSummary {
  id: string;
  propertyId: string;
  name: string;
  createdAt: string;
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
}

export async function createBuilding(propertyId: string, data: { name: string }) {
  const response = await api.post<BuildingSummary>(`/properties/${propertyId}/buildings`, data);
  return response.data;
}

export async function updateBuilding(propertyId: string, buildingId: string, data: { name?: string }) {
  const response = await api.patch<BuildingSummary>(`/properties/${propertyId}/buildings/${buildingId}`, data);
  return response.data;
}

export async function deleteBuilding(propertyId: string, buildingId: string) {
  await api.delete(`/properties/${propertyId}/buildings/${buildingId}`);
}

export async function getBuildingSummaries(propertyId: string): Promise<BuildingSummary[]> {
  const response = await api.get<BuildingSummary[]>(`/properties/${propertyId}/buildings`);
  return response.data;
}
