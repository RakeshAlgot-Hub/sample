// ui/src/types/api.ts

import { Property } from "./property";
import { Building, Floor, Room, Bed } from "./hierarchy";
import { Member } from "./member";
import { User } from "./auth";

// ==================== AUTH API ====================

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

// ==================== PROPERTIES API ====================

export interface CreatePropertyRequest {
  name: string;
  propertyType: "HOSTEL" | "APARTMENT";
  country: string;
  state: string;
  city: string;
  area: string;
  addressLine: string;
  pincode: string;
}

export interface UpdatePropertyRequest {
  name?: string;
  country?: string;
  state?: string;
  city?: string;
  area?: string;
  addressLine?: string;
  pincode?: string;
  isActive?: boolean;
}

// ==================== BUILDINGS API ====================

export interface CreateBuildingRequest {
  property_id: string;
  name: string;
  floor_count: number;
}

// ==================== FLOORS API ====================

export interface CreateFloorRequest {
  building_id: string;
  floor_number: number;
  room_count: number;
}

// ==================== ROOMS API ====================

export interface CreateRoomRequest {
  floor_id: string;
  room_number: string;
  share_type: number;
}

// ==================== MEMBERS API ====================

export interface CreateMemberRequest {
  property_id: string;
  name: string;
  phone: string;
  address?: string;
  bed_id?: string | null;
}

export interface UpdateMemberRequest {
  name?: string;
  phone?: string;
  address?: string;
  bed_id?: string | null;
}

// ==================== PROPERTY WIZARD API ====================

export interface WizardPropertyRequest {
  name: string;
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
}

export interface WizardBuildingInput {
  name: string;
  floor_count: number;
}

export interface WizardFloorInput {
  building_index: number;
  floor_number: number;
  room_count: number;
}

export interface WizardRoomInput {
  building_index: number;
  floor_number: number;
  room_number: number;
  share_type: number;
}

export interface CreateFullPropertyRequest {
  property: WizardPropertyRequest;
  buildings: WizardBuildingInput[];
  floors: WizardFloorInput[];
  rooms: WizardRoomInput[];
}

export interface CreateFullPropertyResponse {
  property: Property;
  buildings: Building[]; // Note: this `Building` will need to be defined in hierarchy.ts
  total_floors: number;
  total_rooms: number;
  total_beds: number;
}

// ==================== PROPERTY DETAILS API ====================

export interface PropertyDetailBuilding extends Building {
  floors: PropertyDetailFloor[];
}

export interface PropertyDetailFloor extends Floor {
  rooms: PropertyDetailRoom[];
}

export interface PropertyDetailRoom extends Room {
  beds: Bed[];
}

export interface PropertyDetails {
  property: Property;
  buildings: PropertyDetailBuilding[];
  members: Member[];
  stats: {
    building_count: number;
    floor_count: number;
    room_count: number;
    bed_count: number;
    occupied_beds: number;
  };
}