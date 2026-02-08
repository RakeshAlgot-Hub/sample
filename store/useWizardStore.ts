import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropertyDetails, Building, Floor, Room, WizardState, Property } from '@/types/property';
import { generateBedsByShareType, generateBedsByCount, getBedCountByShareType } from '@/utils/bedHelpers';

interface WizardStore extends WizardState {
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  updatePropertyDetails: (details: Partial<PropertyDetails>) => void;
  addBuilding: (building: Building) => void;
  updateBuilding: (id: string, name: string) => void;
  removeBuilding: (id: string) => void;
  addFloor: (buildingId: string, floor: Floor) => void;
  updateFloor: (buildingId: string, floorId: string, label: string) => void;
  removeFloor: (buildingId: string, floorId: string) => void;
  addRoom: (buildingId: string, floorId: string, room: Room) => void;
  removeRoom: (buildingId: string, floorId: string, roomId: string) => void;
  updateAllowedBedCounts: (bedCounts: number[]) => void;
  updateBedPricing: (pricing: WizardState['bedPricing']) => void;
  setWizardFromProperty: (property: Property) => void;
  resetWizard: () => void;
  loadWizardState: () => Promise<void>;
  saveWizardState: () => Promise<void>;
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

  setCurrentStep: (step: number) => {
    set({ currentStep: step });
    get().saveWizardState();
  },

  nextStep: () => {
    set((state) => ({ currentStep: state.currentStep + 1 }));
    get().saveWizardState();
  },

  previousStep: () => {
    set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) }));
    get().saveWizardState();
  },

  updatePropertyDetails: (details: Partial<PropertyDetails>) => {
    set((state) => ({
      propertyDetails: { ...state.propertyDetails, ...details },
    }));
    get().saveWizardState();
  },

  addBuilding: (building: Building) => {
    set((state) => ({
      buildings: [...state.buildings, building],
    }));
    get().saveWizardState();
  },

  updateBuilding: (id: string, name: string) => {
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === id ? { ...b, name } : b
      ),
    }));
    get().saveWizardState();
  },

  removeBuilding: (id: string) => {
    set((state) => ({
      buildings: state.buildings.filter((b) => b.id !== id),
    }));
    get().saveWizardState();
  },

  addFloor: (buildingId: string, floor: Floor) => {
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === buildingId
          ? { ...b, floors: [...b.floors, floor] }
          : b
      ),
    }));
    get().saveWizardState();
  },

  updateFloor: (buildingId: string, floorId: string, label: string) => {
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === buildingId
          ? {
            ...b,
            floors: b.floors.map((f) =>
              f.id === floorId ? { ...f, label } : f
            ),
          }
          : b
      ),
    }));
    get().saveWizardState();
  },

  removeFloor: (buildingId: string, floorId: string) => {
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === buildingId
          ? { ...b, floors: b.floors.filter((f) => f.id !== floorId) }
          : b
      ),
    }));
    get().saveWizardState();
  },

  addRoom: (buildingId: string, floorId: string, room: Room) => {
    const bedCount = room.bedCount ?? getBedCountByShareType(room.shareType);
    const roomWithBeds = {
      ...room,
      bedCount,
      beds: bedCount > 0 ? generateBedsByCount(bedCount) : generateBedsByShareType(room.shareType),
    };

    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === buildingId
          ? {
            ...b,
            floors: b.floors.map((f) =>
              f.id === floorId
                ? { ...f, rooms: [...f.rooms, roomWithBeds] }
                : f
            ),
          }
          : b
      ),
    }));
    get().saveWizardState();
  },

  removeRoom: (buildingId: string, floorId: string, roomId: string) => {
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === buildingId
          ? {
            ...b,
            floors: b.floors.map((f) =>
              f.id === floorId
                ? { ...f, rooms: f.rooms.filter((r) => r.id !== roomId) }
                : f
            ),
          }
          : b
      ),
    }));
    get().saveWizardState();
  },

  updateAllowedBedCounts: (bedCounts: number[]) => {
    set({ allowedBedCounts: bedCounts });
    get().saveWizardState();
  },

  updateBedPricing: (pricing) => {
    set({ bedPricing: pricing });
    get().saveWizardState();
  },

  setWizardFromProperty: (property: Property) => {
    const bedCounts = new Set<number>();

    property.buildings.forEach((building) => {
      building.floors.forEach((floor) => {
        floor.rooms.forEach((room) => {
          if (room.beds.length > 0) {
            bedCounts.add(room.beds.length);
          }
        });
      });
    });

    set({
      currentStep: 1,
      propertyDetails: {
        name: property.name,
        type: property.type,
        city: property.city,
        area: property.area,
      },
      buildings: property.buildings,
      allowedBedCounts: Array.from(bedCounts).sort((a, b) => a - b),
      bedPricing: property.bedPricing ?? [],
      editingPropertyId: property.id,
    });
    get().saveWizardState();
  },

  resetWizard: () => {
    set(initialState);
    AsyncStorage.removeItem('wizardState').catch(console.error);
  },

  loadWizardState: async () => {
    try {
      const savedState = await AsyncStorage.getItem('wizardState');
      if (savedState) {
        const parsedState: WizardState = JSON.parse(savedState);
        set({
          ...parsedState,
          bedPricing: parsedState.bedPricing ?? [],
        });
      }
    } catch (error) {
      console.error('Failed to load wizard state:', error);
    }
  },

  saveWizardState: async () => {
    try {
      const state = get();
      const stateToSave: WizardState = {
        currentStep: state.currentStep,
        propertyDetails: state.propertyDetails,
        buildings: state.buildings,
        allowedBedCounts: state.allowedBedCounts,
        bedPricing: state.bedPricing,
        editingPropertyId: state.editingPropertyId ?? null,
      };
      await AsyncStorage.setItem('wizardState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save wizard state:', error);
    }
  },
}));
