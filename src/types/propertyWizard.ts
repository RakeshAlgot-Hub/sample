// ui/src/types/propertyWizard.ts

export interface BuildingConfig {
  name: string;
  floorCount: number;
}

export interface FloorConfig {
  buildingIndex: number;
  floorNumber: number;
  roomCount: number;
}

// Share type decision per floor
export interface FloorShareDecision {
  buildingIndex: number;
  floorNumber: number;
  sameForAll: boolean; // true = same share type for all rooms, false = individual
  uniformShareType?: number; // if sameForAll, this is the share type for all rooms
}

export interface RoomConfig {
  buildingIndex: number;
  floorNumber: number;
  roomNumber: number;
  shareType: number;
}