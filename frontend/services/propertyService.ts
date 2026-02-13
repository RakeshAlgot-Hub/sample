import { PropertySummary, PropertyType } from "@/types/property";
import api from "./api";

export async function createProperty(data: { name: string; type: string; city: string; area: string }) {
  const response = await api.post<PropertySummary>('/properties', data);
  const summary = response.data;
  return { ...summary, type: summary.type as PropertyType };
}

export async function updateProperty(id: string, data: Partial<{ name: string; type: string; city: string; area: string }>) {
  const response = await api.patch<PropertySummary>(`/properties/${id}`, data);
  const summary = response.data;
  return { ...summary, type: summary.type as PropertyType };
}

export async function deleteProperty(id: string) {
  await api.delete(`/properties/${id}`);
}

export async function getPropertySummaries(): Promise<PropertySummary[]> {
  const response = await api.get<PropertySummary[]>('/properties');
  return response.data.map((summary) => ({ ...summary, type: summary.type as PropertyType }));
}
