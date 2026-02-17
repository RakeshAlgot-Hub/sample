import api from './api';

export async function getBuildingSummaries(propertyId: string): Promise<string[]> {
  const response = await api.get<string[]>(`/properties/${propertyId}/buildings`);
  return response.data;
}
