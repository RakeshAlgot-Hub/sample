// Fetch a single property by ID (with buildings, floors, shareTypes)
import { PropertySummary, PropertyType } from "@/types/property";
import api from "./api";
export async function getPropertyById(propertyId: string): Promise<PropertySummary> {
  try {
    const response = await api.get<PropertySummary>(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch property:', error);
    throw error;
  }
}


export async function createProperty(data: { name: string; type: string; city: string; area: string; buildings: any[] }) {
  const response = await api.post<PropertySummary>('/properties', data);
  const summary = response.data;
  return {
    ...summary,
    type: summary.type as PropertyType,
    floors: summary.floors ?? [],
    shareTypes: summary.shareTypes ?? [],
  };
}


// Update property (used for adding new floor/shareType if "Other" is selected)
export async function updateProperty(
  propertyId: string,
  payload: Partial<{ name: string; type: string; city: string; area: string; buildings: any[]; floors: any[]; shareTypes: number[] }>
): Promise<PropertySummary> {
  try {
    const response = await api.put<PropertySummary>(`/properties/${propertyId}`, payload);
    const summary = response.data;
    return {
      ...summary,
      type: summary.type as PropertyType,
      floors: summary.floors ?? [],
      shareTypes: summary.shareTypes ?? [],
    };
  } catch (error) {
    console.error('Failed to update property:', error);
    throw error;
  }
}

export async function deleteProperty(id: string) {
  await api.delete(`/properties/${id}`);
}

export async function getPropertySummaries(): Promise<PropertySummary[]> {
  const response = await api.get<PropertySummary[]>('/properties');
  return response.data.map((summary) => ({
    ...summary,
    type: summary.type as PropertyType,
    floors: summary.floors ?? [],
    shareTypes: summary.shareTypes ?? [],
  }));
}
