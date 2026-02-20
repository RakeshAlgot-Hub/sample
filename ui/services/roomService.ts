import { getApi, handleApiError } from '@/lib/api';

export interface CreateRoomRequest {
  roomNumber: string;
  propertyId: string;
  buildingId: string;
  floor: string;
  shareType: number;
}

export interface RoomResponse {
  id: string;
  roomNumber: string;
  propertyId: string;
  buildingId: string;
  floor: string;
  shareType: number;
  occupiedCount: number;
  createdAt: string;
  updatedAt: string;
}

export const roomService = {
  async createRoom(data: CreateRoomRequest): Promise<RoomResponse> {
    try {
      const api = getApi();
      const response = await api.post<RoomResponse>('/rooms', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getRooms(propertyId: string): Promise<RoomResponse[]> {
    try {
      const api = getApi();
      const response = await api.get<RoomResponse[]>('/rooms', {
        params: { propertyId },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteRoom(id: string): Promise<void> {
    try {
      const api = getApi();
      await api.delete(`/rooms/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
