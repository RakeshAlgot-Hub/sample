// ui/src/types/hierarchy.ts

// These interfaces are used across multiple API calls and components
// and represent the hierarchical structure of a property.

export interface Building {
  id: string;
  property_id: string;
  name: string;
  floor_count: number;
  floors?: Floor[]; // Nested floors
}

export interface Floor {
  id: string;
  building_id: string;
  floor_number: number;
  room_count: number;
  rooms?: Room[]; // Nested rooms
}

export interface Room {
  id: string;
  floor_id: string;
  room_number: string;
  share_type: number;
  beds?: Bed[]; // Nested beds
}

export interface Bed {
  id: string;
  room_id: string;
  bed_number: number;
  is_occupied: boolean;
  // member?: Member; // Add this later when Member type is fully defined and linked
}
