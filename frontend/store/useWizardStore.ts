import { create } from 'zustand';
import { Property, PropertyDetails, PropertyType, WizardState } from '@/types/property';
import { usePropertiesStore } from './usePropertiesStore';
import { useBuildingsStore } from './useBuildingsStore';
import { useFloorsStore } from './useFloorsStore';
import { useRoomsStore } from './useRoomsStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WizardStore extends WizardState {
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  updatePropertyDetails: (details: Partial<PropertyDetails>) => void;
  createProperty: () => Promise<string | null>;
  addBuilding: (propertyId: string, data: { name: string }) => Promise<string | null>;
  addFloor: (propertyId: string, buildingId: string, data: { name: string }) => Promise<string | null>;
  addRoom: (propertyId: string, buildingId: string, floorId: string, data: { name: string; shareType: string }) => Promise<string | null>;
  resetWizard: () => void;
}

const initialPropertyDetails: PropertyDetails = {
  name: '',
  type: null,
  city: '',
  area: '',
};

const initialState: WizardState = {
  currentStep: 1,
  propertyDetails: initialPropertyDetails,
  buildings: [],
  allowedBedCounts: [],
  bedPricing: [],
  editingPropertyId: null,
};

export const useWizardStore = create<WizardStore>((set, get) => ({
  ...initialState,
  resetWizard: () => {
    set(initialState);
  },

  setCurrentStep: (step: number) => {
    set({ currentStep: step });
  },

  nextStep: () => {
    set((state) => ({ currentStep: state.currentStep + 1 }));
  },

  previousStep: () => {
    set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) }));
  },

  updatePropertyDetails: (details: Partial<PropertyDetails>) => {
    set((state) => ({
      propertyDetails: { ...state.propertyDetails, ...details },
    }));
  },

  createProperty: async () => {
    const { propertyDetails } = get();
    if (!propertyDetails.name || !propertyDetails.type || !propertyDetails.city) return null;
    const data = {
      name: propertyDetails.name,
      type: propertyDetails.type as PropertyType,
      city: propertyDetails.city,
      area: propertyDetails.area || '',
    };
    await usePropertiesStore.getState().addProperty(data);
    const properties = usePropertiesStore.getState().properties;
    return properties.length > 0 ? properties[properties.length - 1].id : null;
  },

  addBuilding: async (propertyId, data) => {
    await useBuildingsStore.getState().addBuilding(propertyId, data);
    const buildings = useBuildingsStore.getState().buildings;
    return buildings.length > 0 ? buildings[buildings.length - 1].id : null;
  },

  addFloor: async (propertyId, buildingId, data) => {
    await useFloorsStore.getState().addFloor(propertyId, buildingId, data);
    const floors = useFloorsStore.getState().floors;
    return floors.length > 0 ? floors[floors.length - 1].id : null;
  },

  addRoom: async (propertyId, buildingId, floorId, data) => {
    await useRoomsStore.getState().addRoom(propertyId, buildingId, floorId, data);
    const rooms = useRoomsStore.getState().rooms;
    return rooms.length > 0 ? rooms[rooms.length - 1].id : null;
  },


  updateAllowedBedCounts: (bedCounts: number[]) => {
    set({ allowedBedCounts: bedCounts });
  },

  updateBedPricing: (pricing: WizardState['bedPricing']) => {
    set({ bedPricing: pricing });
  },

  // setWizardFromProperty, loadWizardState, saveWizardState removed (no persistence in backend-driven wizard)
}));
