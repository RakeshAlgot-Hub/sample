// ui/src/types/property.ts

// This interface represents the core property structure returned by the API.
export interface Property {
  id: string;
  name: string;
  propertyType: string;
  country: string;
  state: string;
  city: string;
  area: string;
  addressLine: string;
  pincode: string;
  ownerId: string;
  isActive: boolean;
  building_count: number;
  room_count: number;
  bed_count: number;
  occupied_beds: number;
  createdAt: string;
  updatedAt: string;
}
