import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Property } from '@/types/property';

interface PropertiesStore {
  properties: Property[];
  addProperty: (property: Property) => Promise<void>;
  removeProperty: (id: string) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
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
}

export const usePropertiesStore = create<PropertiesStore>((set, get) => ({
  properties: [],

  addProperty: async (property: Property) => {
    set((state) => ({
      properties: [...state.properties, property],
    }));
    await get().saveProperties();
  },

  removeProperty: async (id: string) => {
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    }));
    await get().saveProperties();
  },

  updateProperty: async (id: string, updates: Partial<Property>) => {
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
    await get().saveProperties();
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
      const savedProperties = await AsyncStorage.getItem('properties');
      if (savedProperties) {
        const properties: Property[] = JSON.parse(savedProperties);
        set({ properties });
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  },

  saveProperties: async () => {
    try {
      const { properties } = get();
      await AsyncStorage.setItem('properties', JSON.stringify(properties));
    } catch (error) {
      console.error('Failed to save properties:', error);
    }
  },
}));
