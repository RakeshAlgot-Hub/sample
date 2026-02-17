import api from './api';

export interface CreateMemberWithBedRequest {
  name: string;
  phone: string;
  propertyId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  bedId: string;
  billingCycle: number;
  rentAmount: number;
}

// Fetch members with pagination
export async function getMembers(propertyId: string, page = 1, limit = 20) {
  const response = await api.get(`/api/members?propertyId=${propertyId}&page=${page}&limit=${limit}`);
  return response.data;
}

export async function createMemberWithBed(data: CreateMemberWithBedRequest) {
  // Returns created member or throws error
  const response = await api.post('/members', data);
  return response.data;
}
