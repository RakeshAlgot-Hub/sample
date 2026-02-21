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

export interface PaginatedRoomResponse {
  data: RoomResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoomQueryParams {
  propertyId: string;
  page?: number;
  limit?: number;
  search?: string;
  buildingId?: string;
  floor?: string;
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

  async getRooms(propertyId: string, params?: Omit<RoomQueryParams, 'propertyId'>): Promise<PaginatedRoomResponse> {
    try {
      const api = getApi();
      const response = await api.get<PaginatedRoomResponse>('/rooms', {
        params: {
          propertyId,
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
          buildingId: params?.buildingId,
          floor: params?.floor
        },
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
