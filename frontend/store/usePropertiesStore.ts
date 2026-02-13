import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropertySummary } from '@/types/property';
import {
  getPropertySummaries,
  savePropertySummary
} from '@/utils/propertyRepository';

interface PropertiesStore {
  properties: PropertySummary[];
  activePropertyId: string | null;
  addProperty: (property: any) => Promise<void>; // Accept any, only summary is stored
  removeProperty: (id: string) => Promise<void>;
  updateProperty: (id: string, updates: Partial<any>) => Promise<void>;
  setActiveProperty: (id: string | null) => Promise<void>;
  loadProperties: () => Promise<void>;
  reset: () => void;
}




export const usePropertiesStore = create<PropertiesStore>((set, get) => ({
  properties: [],
  activePropertyId: null,
  // No-op, not needed in summary-only store
  updateBedOccupancy: async (_bedId: string, _occupied: boolean) => {},

  addProperty: async (property: any) => {
    // Save summary for listing (do not store full property as summary)
    const summary = {
      id: property.id,
      name: property.name,
      type: property.type,
      city: property.city,
      area: property.area,
      createdAt: property.createdAt,
      totalBuildings: property.totalBuildings ?? property.buildings?.length ?? 0,
      totalRooms: property.totalRooms ?? 0,
      totalFloors: property.totalFloors ?? (property.buildings?.reduce((acc: number, b: any) => acc + (b.floors ? b.floors.length : 0), 0) ?? 0),
      totalBeds: property.totalBeds ?? 0,
      occupiedBeds: property.occupiedBeds ?? 0,
      availableBeds: property.availableBeds ?? 0,
    };
    await savePropertySummary(summary);
    await get().loadProperties();
    const { activePropertyId } = get();
    if (!activePropertyId) {
      await get().setActiveProperty(property.id);
    }
  },


  removeProperty: async (id: string) => {
    // Remove from summary and all related collections if needed
    const summaries = (await getPropertySummaries()).filter((p) => p.id !== id);
    await AsyncStorage.setItem('properties_collection', JSON.stringify(summaries));
    await get().loadProperties();
    const { activePropertyId } = get();
    if (activePropertyId === id) {
      const nextActive = summaries.length > 0 ? summaries[0].id : null;
      await get().setActiveProperty(nextActive);
    }
  },


  updateProperty: async (id: string, updates: Partial<any>) => {
    // Update summary and reload full property
    const summaries = await getPropertySummaries();
    const idx = summaries.findIndex((p) => p.id === id);
    if (idx >= 0) {
      summaries[idx] = { ...summaries[idx], ...updates };
      await AsyncStorage.setItem('properties_collection', JSON.stringify(summaries));
      // TODO: Update full property details in separate collection if needed
      await get().loadProperties();
    }
  },

  setActiveProperty: async (id: string | null) => {
    set({ activePropertyId: id });
    if (id) {
      await AsyncStorage.setItem('activePropertyId', id);
    } else {
      await AsyncStorage.removeItem('activePropertyId');
    }
  },




  loadProperties: async () => {
    try {
      const summaries = await getPropertySummaries();
      set({ properties: summaries });
      const activeId = await AsyncStorage.getItem('activePropertyId');
      set({ activePropertyId: activeId });
      if (!activeId && summaries.length > 0) {
        await get().setActiveProperty(summaries[0].id);
      }
      if (activeId && !summaries.some((p) => p.id === activeId)) {
        const fallbackId = summaries.length > 0 ? summaries[0].id : null;
        await get().setActiveProperty(fallbackId);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  },


  reset: () => {
    set({ properties: [], activePropertyId: null });
    AsyncStorage.removeItem('activePropertyId').catch(console.error);
  },
}));
