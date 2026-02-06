export type PropertyType = 'Hostel/PG' | 'Apartment';
export type ShareType = 'single' | 'double' | 'triple';

export interface Bed {
  id: string;
  occupied: boolean;
}

export interface Room {
  id: string;
  roomNumber: string;
  shareType: ShareType;
  beds: Bed[];
}

export interface Floor {
  id: string;
  label: string;
  rooms: Room[];
}

export interface Building {
  id: string;
  name: string;
  floors: Floor[];
}

export interface PropertyDetails {
  name: string;
  type: PropertyType | null;
  city: string;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  city: string;
  buildings: Building[];
  totalRooms: number;
  totalBeds: number;
  createdAt: string;
}

export interface WizardState {
  currentStep: number;
  propertyDetails: PropertyDetails;
  buildings: Building[];
  allowedBedCounts: number[];
  editingPropertyId?: string | null;
}
