import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { propertyService, PropertyResponse } from '@/services/propertyService';

export type Building = { id: string; name: string };
export type Floor = { id: string; name: string };
export type Property = PropertyResponse & {
  buildings: Building[];
  floors: Floor[];
  shareTypes: number[];
};

interface PropertyState {
  properties: Property[];
  selectedPropertyId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  fetchProperties: () => Promise<void>;
  addProperty: (
    name: string,
    type: 'Hostel' | 'Apartment',
    city: string,
    address: string,
    buildings: Building[],
  ) => Promise<{ property: Property | null, status: number }>;
  deleteProperty: (id: string) => Promise<void>;
  selectProperty: (id: string) => void;
  getSelectedProperty: () => Property | null;
  clearError: () => void;
}

const SELECTED_PROPERTY_KEY = '@tenant_tracker_selected_property';
const DEFAULT_FLOORS = ['G', '1', '2', '3', '4'];
const DEFAULT_SHARE_TYPES = [1, 2, 3, 4, 5];

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  selectedPropertyId: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      const storedSelectedId = await AsyncStorage.getItem(SELECTED_PROPERTY_KEY);
      set({ selectedPropertyId: storedSelectedId, isInitialized: true });

      await get().fetchProperties();
    } catch (error) {
      console.error('Failed to initialize properties:', error);
      set({ isInitialized: true });
    }
  },

  fetchProperties: async () => {
    set({ isLoading: true, error: null });

    try {
      const properties = await propertyService.getProperties();
      // Normalize all properties to ensure buildings are Building[]
      const normalizedProperties = properties.map((prop: any) => {
        if (Array.isArray(prop.buildings) && typeof prop.buildings[0] === 'string') {
          return {
            ...prop,
            buildings: prop.buildings.map((b: any, idx: number) =>
              typeof b === 'string' ? { id: String(idx), name: b } : b
            ),
          };
        }
        return prop;
      });
      set({ properties: normalizedProperties, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch properties';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  addProperty: async (name, type, city, address, buildings) => {
    set({ isLoading: true, error: null });
    try {
      const { property, status } = await propertyService.createProperty({
        name,
        type,
        city,
        address,
        buildings,
      });
      // Ensure buildings are Building[]
      let normalizedProperty = property;
      if (property && Array.isArray(property.buildings) && typeof property.buildings[0] === 'string') {
        normalizedProperty = {
          ...property,
          buildings: property.buildings.map((b: any, idx: number) =>
            typeof b === 'string' ? { id: String(idx), name: b } : b
          ),
        };
      }
      if (status === 201) {
        set((state) => ({
          properties: [...state.properties, normalizedProperty],
          selectedPropertyId: normalizedProperty.id,
          isLoading: false,
        }));
        await AsyncStorage.setItem(SELECTED_PROPERTY_KEY, normalizedProperty.id);
        return { property: normalizedProperty, status };
      } else {
        set({ isLoading: false });
        return { property: null, status };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add property';
      set({ isLoading: false, error: errorMessage });
      return { property: null, status: 0 };
    }
  },

  deleteProperty: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await propertyService.deleteProperty(id);

      const state = get();
      const updatedProperties = state.properties.filter((prop) => prop.id !== id);
      let newSelectedId = state.selectedPropertyId;

      if (state.selectedPropertyId === id) {
        newSelectedId = updatedProperties.length > 0 ? updatedProperties[0].id : null;
      }

      set({
        properties: updatedProperties,
        selectedPropertyId: newSelectedId,
        isLoading: false,
      });

      if (newSelectedId) {
        await AsyncStorage.setItem(SELECTED_PROPERTY_KEY, newSelectedId);
      } else {
        await AsyncStorage.removeItem(SELECTED_PROPERTY_KEY);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete property';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  selectProperty: async (id) => {
    try {
      await AsyncStorage.setItem(SELECTED_PROPERTY_KEY, id);
      set({ selectedPropertyId: id });
    } catch (error) {
      console.error('Failed to select property:', error);
    }
  },

  getSelectedProperty: () => {
    const state = get();
    return (
      state.properties.find((prop) => prop.id === state.selectedPropertyId) ||
      null
    );
  },


  clearError: () => {
    set({ error: null });
  },

  clear: () => {
    set({ properties: [], selectedPropertyId: null, isLoading: false, isInitialized: false, error: null });
    AsyncStorage.removeItem(SELECTED_PROPERTY_KEY);
  },
}));
