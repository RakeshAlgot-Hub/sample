export type PropertyType = 'Hostel/PG' | 'Apartments';
export type ShareType = 'single' | 'double' | 'triple';
export type BillingPeriod = 'monthly' | 'weekly' | 'hourly' | 'yearly';

export interface BedPricing {
  bedCount: number;
  dailyPrice: number;
  monthlyPrice: number;
}

export interface Bed {
  id: string;
  occupied: boolean;
}

export interface Room {
  id: string;
  roomNumber: string;
  shareType: ShareType;
  bedCount?: number;
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
  area?: string;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  city: string;
  area?: string;
  buildings: Building[];
  bedPricing: BedPricing[];
  totalRooms: number;
  totalBeds: number;
  createdAt: string;
}

export interface WizardState {
  currentStep: number;
  propertyDetails: PropertyDetails;
  buildings: Building[];
  allowedBedCounts: number[];
  bedPricing: BedPricing[];
  editingPropertyId?: string | null;
}
