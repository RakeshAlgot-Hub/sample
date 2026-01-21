import { create } from 'zustand';
import { BuildingConfig, FloorConfig, FloorShareDecision, RoomConfig } from '@/types/propertyWizard';

interface PropertyWizardState {
  // Step 1: Property Details
  propertyName: string;
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  buildingCount: number;

  // Step 2: Building Setup
  buildings: BuildingConfig[];

  // Step 3: Floor Configuration
  floors: FloorConfig[];

  // Step 4: Share Type Decisions per floor
  floorShareDecisions: FloorShareDecision[];

  // Step 5: Room Configuration (only for floors with individual share types)
  rooms: RoomConfig[];

  // Current step
  currentStep: number;
  currentBuildingIndex: number;

  // Actions
  setPropertyDetails: (details: Partial<Pick<PropertyWizardState, 'propertyName' | 'country' | 'state' | 'city' | 'address' | 'phone' | 'buildingCount'>>) => void;
  setBuilding: (index: number, config: Partial<BuildingConfig>) => void;
  initializeBuildings: () => void;
  setFloor: (buildingIndex: number, floorNumber: number, roomCount: number) => void;
  initializeFloors: () => void;
  setFloorShareDecision: (buildingIndex: number, floorNumber: number, sameForAll: boolean, uniformShareType?: number) => void;
  initializeFloorShareDecisions: () => void;
  setRoom: (buildingIndex: number, floorNumber: number, roomNumber: number, shareType: number) => void;
  initializeRooms: () => void;
  hasIndividualFloors: () => boolean;
  nextStep: () => void;
  nextBuilding: () => boolean;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  propertyName: '',
  country: '',
  state: '',
  city: '',
  address: '',
  phone: '',
  buildingCount: 1,
  buildings: [],
  floors: [],
  floorShareDecisions: [],
  rooms: [],
  currentStep: 1,
  currentBuildingIndex: 0,
};

export const usePropertyWizardStore = create<PropertyWizardState>((set, get) => ({
  ...initialState,

  setPropertyDetails: (details) => set((state) => ({ ...state, ...details })),

  setBuilding: (index, config) => set((state) => {
    const buildings = [...state.buildings];
    buildings[index] = { ...buildings[index], ...config };
    return { buildings };
  }),

  initializeBuildings: () => set((state) => {
    const buildings: BuildingConfig[] = [];
    for (let i = 0; i < state.buildingCount; i++) {
      buildings.push({
        name: `Building ${i + 1}`,
        floorCount: 1,
      });
    }
    return { buildings, currentBuildingIndex: 0 };
  }),

  setFloor: (buildingIndex, floorNumber, roomCount) => set((state) => {
    const floors = [...state.floors];
    const existingIndex = floors.findIndex(
      f => f.buildingIndex === buildingIndex && f.floorNumber === floorNumber
    );
    if (existingIndex >= 0) {
      floors[existingIndex] = { buildingIndex, floorNumber, roomCount };
    } else {
      floors.push({ buildingIndex, floorNumber, roomCount });
    }
    return { floors };
  }),

  initializeFloors: () => set((state) => {
    const floors: FloorConfig[] = [];
    state.buildings.forEach((building, buildingIndex) => {
      for (let i = 1; i <= building.floorCount; i++) {
        floors.push({
          buildingIndex,
          floorNumber: i,
          roomCount: 1,
        });
      }
    });
    return { floors };
  }),

  setFloorShareDecision: (buildingIndex, floorNumber, sameForAll, uniformShareType) => set((state) => {
    const decisions = [...state.floorShareDecisions];
    const existingIndex = decisions.findIndex(
      d => d.buildingIndex === buildingIndex && d.floorNumber === floorNumber
    );
    const decision: FloorShareDecision = { buildingIndex, floorNumber, sameForAll, uniformShareType };
    if (existingIndex >= 0) {
      decisions[existingIndex] = decision;
    } else {
      decisions.push(decision);
    }
    return { floorShareDecisions: decisions };
  }),

  initializeFloorShareDecisions: () => set((state) => {
    const decisions: FloorShareDecision[] = [];
    state.floors.forEach((floor) => {
      decisions.push({
        buildingIndex: floor.buildingIndex,
        floorNumber: floor.floorNumber,
        sameForAll: true, // default to same for all
        uniformShareType: undefined, // not yet selected
      });
    });
    return { floorShareDecisions: decisions };
  }),

  setRoom: (buildingIndex, floorNumber, roomNumber, shareType) => set((state) => {
    const rooms = [...state.rooms];
    const existingIndex = rooms.findIndex(
      r => r.buildingIndex === buildingIndex && r.floorNumber === floorNumber && r.roomNumber === roomNumber
    );
    if (existingIndex >= 0) {
      rooms[existingIndex] = { buildingIndex, floorNumber, roomNumber, shareType };
    } else {
      rooms.push({ buildingIndex, floorNumber, roomNumber, shareType });
    }
    return { rooms };
  }),

  initializeRooms: () => set((state) => {
    const rooms: RoomConfig[] = [];
    state.floors.forEach((floor) => {
      const decision = state.floorShareDecisions.find(
        d => d.buildingIndex === floor.buildingIndex && d.floorNumber === floor.floorNumber
      );
      
      for (let i = 1; i <= floor.roomCount; i++) {
        rooms.push({
          buildingIndex: floor.buildingIndex,
          floorNumber: floor.floorNumber,
          roomNumber: i,
          // If sameForAll and has uniformShareType, use it; otherwise default to 0 (not set)
          shareType: decision?.sameForAll && decision.uniformShareType 
            ? decision.uniformShareType 
            : 0,
        });
      }
    });
    return { rooms };
  }),

  hasIndividualFloors: () => {
    const state = get();
    return state.floorShareDecisions.some(d => !d.sameForAll);
  },

  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),

  nextBuilding: () => {
    const state = get();
    if (state.currentBuildingIndex < state.buildingCount - 1) {
      set({ currentBuildingIndex: state.currentBuildingIndex + 1 });
      return true;
    }
    return false;
  },

  setCurrentStep: (step) => set({ currentStep: step }),

  reset: () => set(initialState),
}));
