import api from './api';

export interface RoomSummary {
  id: string;
  floorId: string;
  buildingId: string;
  propertyId: string;
  name: string;
  shareType: string;
  createdAt: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
}

export async function createRoom(propertyId: string, buildingId: string, floorId: string, data: { name: string; shareType: string }) {
  const response = await api.post<RoomSummary>(`/properties/${propertyId}/buildings/${buildingId}/floors/${floorId}/rooms`, data);
  return response.data;
}

export async function updateRoom(propertyId: string, buildingId: string, floorId: string, roomId: string, data: { name?: string; shareType?: string }) {
  const response = await api.patch<RoomSummary>(`/properties/${propertyId}/buildings/${buildingId}/floors/${floorId}/rooms/${roomId}`, data);
  return response.data;
}

export async function deleteRoom(propertyId: string, buildingId: string, floorId: string, roomId: string) {
  await api.delete(`/properties/${propertyId}/buildings/${buildingId}/floors/${floorId}/rooms/${roomId}`);
}

export async function getRoomSummaries(propertyId: string, buildingId: string, floorId: string): Promise<RoomSummary[]> {
  const response = await api.get<RoomSummary[]>(`/properties/${propertyId}/buildings/${buildingId}/floors/${floorId}/rooms`);
  return response.data;
}
