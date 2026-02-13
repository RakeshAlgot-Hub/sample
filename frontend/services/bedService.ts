import api from './api';

export interface BedSummary {
  id: string;
  roomId: string;
  floorId: string;
  buildingId: string;
  propertyId: string;
  occupied: boolean;
  createdAt: string;
}


// Fetch available beds for a room, paginated, summary only
export interface AvailableBedSummary {
  monthlyPrice: any;
  dailyPrice: any;
  bedNumber: number;
  floorLabel: string;
  roomNumber: string;
  propertyName: string;
  id: string;
  roomId: string;
  floorId: string;
  buildingId: string;
  propertyId: string;
  occupied: boolean;
  createdAt: string;
}

export interface AvailableBedsResponse {
  beds: AvailableBedSummary[];
  hasMore: boolean;
}

export async function getAvailableBeds({
  propertyId,
  buildingId,
  floorId,
  roomId,
  page = 1,
  limit = 20,
}: {
  propertyId: string;
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  page?: number;
  limit?: number;
}): Promise<AvailableBedsResponse> {
  const params = new URLSearchParams({
    propertyId,
    ...(buildingId ? { buildingId } : {}),
    ...(floorId ? { floorId } : {}),
    ...(roomId ? { roomId } : {}),
    page: String(page),
    limit: String(limit),
  });
  const response = await api.get<AvailableBedsResponse>(`/beds/available?${params.toString()}`);
  return response.data;
}
