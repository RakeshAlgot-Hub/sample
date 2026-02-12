import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as propertyService from '@/services/propertyService';
import { Property } from '@/types/property';

interface PropertiesStore {
  properties: Property[];
  activePropertyId: string | null;
  addProperty: (property: Property) => Promise<void>;
  removeProperty: (id: string) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  setActiveProperty: (id: string | null) => Promise<void>;
  updateBedOccupancy: (
    propertyId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    bedId: string,
    occupied: boolean
  ) => Promise<void>;
  syncBedOccupancyWithMembers: (members: any[]) => Promise<void>;
  loadProperties: () => Promise<void>;
  saveProperties: () => Promise<void>;
  reset: () => void;
}

export const usePropertiesStore = create<PropertiesStore>((set, get) => ({
  properties: [],
  activePropertyId: null,

  addProperty: async (property: Property) => {
    const created = await propertyService.createProperty(property) as Property;
    set((state) => ({
      properties: [...state.properties, created],
    }));
    const { activePropertyId } = get();
    if (!activePropertyId) {
      await get().setActiveProperty(created.id);
    }
    // No return value needed
  },

  removeProperty: async (id: string) => {
    await propertyService.deleteProperty(id);
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    }));
    const { activePropertyId, properties } = get();
    if (activePropertyId === id) {
      const nextActive = properties.length > 0 ? properties[0].id : null;
      await get().setActiveProperty(nextActive);
    }
  },

  updateProperty: async (id: string, updates: Partial<Property>) => {
    const updated = await propertyService.updateProperty(id, updates);
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id && updated && typeof updated === 'object' ? { ...p, ...updated } : p
      ),
    }));
  },

  setActiveProperty: async (id: string | null) => {
    set({ activePropertyId: id });
    if (id) {
      await AsyncStorage.setItem('activePropertyId', id);
    } else {
      await AsyncStorage.removeItem('activePropertyId');
    }
  },

  updateBedOccupancy: async (
    propertyId: string,
    buildingId: string,
    floorId: string,
    roomId: string,
    bedId: string,
    occupied: boolean
  ) => {
    set((state) => ({
      properties: state.properties.map((property) =>
        property.id === propertyId
          ? {
            ...property,
            buildings: property.buildings.map((building) =>
              building.id === buildingId
                ? {
                  ...building,
                  floors: building.floors.map((floor) =>
                    floor.id === floorId
                      ? {
                        ...floor,
                        rooms: floor.rooms.map((room) =>
                          room.id === roomId
                            ? {
                              ...room,
                              beds: room.beds.map((bed) =>
                                bed.id === bedId
                                  ? { ...bed, occupied }
                                  : bed
                              ),
                            }
                            : room
                        ),
                      }
                      : floor
                  ),
                }
                : building
            ),
          }
          : property
      ),
    }));
    await get().saveProperties();
  },

  syncBedOccupancyWithMembers: async (members: any[]) => {
    const occupiedBeds = new Set<string>();
    members.forEach((member) => {
      if (
        member.propertyId &&
        member.buildingId &&
        member.floorId &&
        member.roomId &&
        member.bedId
      ) {
        const key = `${member.propertyId}-${member.buildingId}-${member.floorId}-${member.roomId}-${member.bedId}`;
        occupiedBeds.add(key);
      }
    });

    set((state) => ({
      properties: state.properties.map((property) => ({
        ...property,
        buildings: property.buildings.map((building) => ({
          ...building,
          floors: building.floors.map((floor) => ({
            ...floor,
            rooms: floor.rooms.map((room) => ({
              ...room,
              beds: room.beds.map((bed) => {
                const key = `${property.id}-${building.id}-${floor.id}-${room.id}-${bed.id}`;
                return {
                  ...bed,
                  occupied: occupiedBeds.has(key),
                };
              }),
            })),
          })),
        })),
      })),
    }));

    await get().saveProperties();
  },

  loadProperties: async () => {
    try {
      const properties = await propertyService.getProperties() as Property[];
      set({ properties });
      // Optionally, set activePropertyId if needed
      if (properties.length > 0) {
        await get().setActiveProperty(properties[0].id);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  },

  saveProperties: async () => {
    // No-op: persistence is now handled by backend
  },

  reset: () => {
    set({ properties: [], activePropertyId: null });
    AsyncStorage.removeItem('activePropertyId').catch(console.error);
  },
}));
