import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropertySummary, PropertyType } from '@/types/property';

// Types for hierarchy
export interface Building {
  id: string;
  propertyId: string;
  name: string;
}
export interface Floor {
  id: string;
  buildingId: string;
  label: string;
}
export interface Room {
  id: string;
  floorId: string;
  roomNumber: string;
  shareType: string;
  bedCount: number;
}
export interface Bed {
  id: string;
  roomId: string;
  occupied: boolean;
}

// Simulate backend delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// --- Property Summaries ---
export async function getPropertySummaries(): Promise<PropertySummary[]> {
  await delay(400);
  const data = await AsyncStorage.getItem('properties_collection');
  return data ? JSON.parse(data) : [];
}

export async function savePropertySummary(summary: PropertySummary): Promise<void> {
  await delay(400);
  const summaries = await getPropertySummaries();
  const idx = summaries.findIndex((s) => s.id === summary.id);
  if (idx >= 0) {
    summaries[idx] = summary;
  } else {
    summaries.push(summary);
  }
  await AsyncStorage.setItem('properties_collection', JSON.stringify(summaries));
}

// --- Buildings ---
export async function getBuildingsByProperty(propertyId: string): Promise<Building[]> {
  await delay(400);
  const data = await AsyncStorage.getItem('buildings_collection');
  const all: Building[] = data ? JSON.parse(data) : [];
  return all.filter((b) => b.propertyId === propertyId);
}

export async function saveBuilding(building: Building): Promise<void> {
  await delay(400);
  const data = await AsyncStorage.getItem('buildings_collection');
  const all: Building[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((b) => b.id === building.id);
  if (idx >= 0) {
    all[idx] = building;
  } else {
    all.push(building);
  }
  await AsyncStorage.setItem('buildings_collection', JSON.stringify(all));
}

// --- Floors ---
export async function getFloorsByBuilding(buildingId: string): Promise<Floor[]> {
  await delay(400);
  const data = await AsyncStorage.getItem('floors_collection');
  const all: Floor[] = data ? JSON.parse(data) : [];
  return all.filter((f) => f.buildingId === buildingId);
}

export async function saveFloor(floor: Floor): Promise<void> {
  await delay(400);
  const data = await AsyncStorage.getItem('floors_collection');
  const all: Floor[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((f) => f.id === floor.id);
  if (idx >= 0) {
    all[idx] = floor;
  } else {
    all.push(floor);
  }
  await AsyncStorage.setItem('floors_collection', JSON.stringify(all));
}

// --- Rooms ---
export async function getRoomsByFloor(floorId: string, page = 1, limit = 100): Promise<Room[]> {
  await delay(400);
  const data = await AsyncStorage.getItem('rooms_collection');
  const all: Room[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((r) => r.floorId === floorId);
  const start = (page - 1) * limit;
  return filtered.slice(start, start + limit);
}

export async function saveRoom(room: Room): Promise<void> {
  await delay(400);
  const data = await AsyncStorage.getItem('rooms_collection');
  const all: Room[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((r) => r.id === room.id);
  if (idx >= 0) {
    all[idx] = room;
  } else {
    all.push(room);
  }
  await AsyncStorage.setItem('rooms_collection', JSON.stringify(all));
}

// --- Beds ---
export async function getBedsByRoom(roomId: string): Promise<Bed[]> {
  await delay(400);
  const data = await AsyncStorage.getItem('beds_collection');
  const all: Bed[] = data ? JSON.parse(data) : [];
  return all.filter((b) => b.roomId === roomId);
}

export async function saveBed(bed: Bed): Promise<void> {
  await delay(400);
  const data = await AsyncStorage.getItem('beds_collection');
  const all: Bed[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((b) => b.id === bed.id);
  if (idx >= 0) {
    all[idx] = bed;
  } else {
    all.push(bed);
  }
  await AsyncStorage.setItem('beds_collection', JSON.stringify(all));
}
