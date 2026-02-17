
import api from './api';

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  buildingName: string;
  floorName: string;
  shareType: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Fetch all rooms for a property
export async function getRoomsByProperty(propertyId: string): Promise<Room[]> {
  try {
    const response = await api.get<Room[]>(`/rooms?propertyId=${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    throw error;
  }
}

// Create a new room
export async function createRoom(payload: {
  propertyId: string;
  roomNumber: string;
  buildingName: string;
  floorName: string;
  shareType: number;
}): Promise<Room> {
  try {
    const response = await api.post<Room>('/rooms', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to create room:', error);
    throw error;
  }
}

// Update a room
export async function updateRoom(roomId: string, payload: Partial<Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>>): Promise<Room> {
  try {
    const response = await api.put<Room>(`/rooms/${roomId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to update room:', error);
    throw error;
  }
}

// Delete a room
export async function deleteRoom(roomId: string): Promise<void> {
  try {
    await api.delete(`/rooms/${roomId}`);
  } catch (error) {
    console.error('Failed to delete room:', error);
    throw error;
  }
}
