import { create } from 'zustand';
import { Property } from '@/types/property';
import { Member } from '@/types/member';
import { propertiesApi, CreatePropertyInput } from '@/services/propertiesApi';

interface PropertiesStore {
  properties: Property[];
  activePropertyId: string | null;
  addProperty: (property: CreatePropertyInput) => Promise<Property>;
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
  syncBedOccupancyWithMembers: (members: Member[]) => Promise<void>;
  loadProperties: () => Promise<Property[]>;
  reset: () => void;
}

const normalizeBedPricing = (property: Property): Property => {
  const normalizedPricing = (property.bedPricing ?? []).map((entry: any) => ({
    bedCount: entry.bedCount,
    dailyPrice: Number(entry.dailyPrice ?? entry.price ?? 0),
    monthlyPrice: Number(entry.monthlyPrice ?? entry.price ?? 0),
  }));

  return {
    ...property,
    bedPricing: normalizedPricing,
  };
};

export const usePropertiesStore = create<PropertiesStore>((set, get) => ({
  properties: [],
  activePropertyId: null,

  addProperty: async (property: CreatePropertyInput) => {
    const created = normalizeBedPricing(await propertiesApi.create(property));

    set((state) => ({
      properties: [...state.properties, created],
    }));

    const { activePropertyId } = get();
    if (!activePropertyId) {
      await get().setActiveProperty(created.id);
    }

    return created;
  },

  removeProperty: async (id: string) => {
    await propertiesApi.remove(id);

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
    const updated = normalizeBedPricing(await propertiesApi.update(id, updates));

    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? updated : p
      ),
    }));
  },

  setActiveProperty: async (id: string | null) => {
    set({ activePropertyId: id });
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
  },

  syncBedOccupancyWithMembers: async (members: Member[]) => {
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

  },

  loadProperties: async () => {
    try {
      const properties = (await propertiesApi.getAll()).map(normalizeBedPricing);
      set({ properties });

      const { activePropertyId } = get();
      if (!activePropertyId && properties.length > 0) {
        await get().setActiveProperty(properties[0].id);
      }
      if (activePropertyId && !properties.some((p) => p.id === activePropertyId)) {
        const fallbackId = properties.length > 0 ? properties[0].id : null;
        await get().setActiveProperty(fallbackId);
      }

      return properties;
    } catch (error) {
      console.error('Failed to load properties:', error);
      set({ properties: [], activePropertyId: null });
      return [];
    }
  },

  reset: () => {
    set({ properties: [], activePropertyId: null });
  },
}));
