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

export async function createMemberWithBed(data: CreateMemberWithBedRequest) {
  // Returns created member or throws error
  const response = await api.post('/members', data);
  return response.data;
}
