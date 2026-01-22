
/**
 * API Service Layer
 * All backend communication goes through this service.
 * Replace API_BASE_URL with your actual backend URL when ready.
 */

import { LoginRequest, RegisterRequest, WizardPropertyRequest, WizardBuildingInput, WizardFloorInput, WizardRoomInput, CreateFullPropertyRequest, CreateFullPropertyResponse, CreatePropertyRequest, UpdatePropertyRequest, CreateBuildingRequest, CreateFloorRequest, CreateRoomRequest, CreateMemberRequest, UpdateMemberRequest, PropertyDetailBuilding, PropertyDetailFloor, PropertyDetailRoom, PropertyDetails } from "../types/api";
import { User } from "../types/auth";
import { Property } from "../types/property";
import { Building, Floor, Room, Bed } from "../types/hierarchy";
import { Member } from "../types/member";

const API_BASE_URL = "/api";
console.log(API_BASE_URL)

// Generic API request handler
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || error.detail || "Request failed");
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
};

// ==================== AUTH API ====================

export const authApi = {
  login: (data: LoginRequest): Promise<User> =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  register: (data: RegisterRequest): Promise<User> =>
    apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  logout: (): Promise<void> =>
    apiRequest("/auth/logout", { method: "POST" }),
};


// ==================== PROPERTIES API ====================

export const propertiesApi = {
  list: (): Promise<Property[]> =>
    apiRequest("/properties"),

  get: (id: string): Promise<Property> =>
    apiRequest(`/properties/${id}`),

  create: (data: CreatePropertyRequest): Promise<Property> =>
    apiRequest("/properties", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: UpdatePropertyRequest): Promise<Property> =>
    apiRequest(`/properties/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/properties/${id}`, { method: "DELETE" }),
};

// ==================== BUILDINGS API ====================

export const buildingsApi = {
  listByProperty: (propertyId: string): Promise<Building[]> =>
    apiRequest(`/properties/${propertyId}/buildings`),

  get: (id: string): Promise<Building> =>
    apiRequest(`/buildings/${id}`),

  create: (data: CreateBuildingRequest): Promise<Building> =>
    apiRequest('/buildings', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<CreateBuildingRequest>): Promise<Building> =>
    apiRequest(`/buildings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/buildings/${id}`, { method: 'DELETE' }),
};

// ==================== FLOORS API ====================

export const floorsApi = {
  listByBuilding: (buildingId: string): Promise<Floor[]> =>
    apiRequest(`/buildings/${buildingId}/floors`),

  get: (id: string): Promise<Floor> =>
    apiRequest(`/floors/${id}`),

  create: (data: CreateFloorRequest): Promise<Floor> =>
    apiRequest('/floors', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<CreateFloorRequest>): Promise<Floor> =>
    apiRequest(`/floors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/floors/${id}`, { method: 'DELETE' }),
};

// ==================== ROOMS API ====================

export const roomsApi = {
  listByFloor: (floorId: string): Promise<Room[]> =>
    apiRequest(`/floors/${floorId}/rooms`),

  get: (id: string): Promise<Room> =>
    apiRequest(`/rooms/${id}`),

  create: (data: CreateRoomRequest): Promise<Room> =>
    apiRequest('/rooms', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<CreateRoomRequest>): Promise<Room> =>
    apiRequest(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/rooms/${id}`, { method: 'DELETE' }),
};

// ==================== BEDS API ====================

export const bedsApi = {
  listByRoom: (roomId: string): Promise<Bed[]> =>
    apiRequest(`/rooms/${roomId}/beds`),

  get: (id: string): Promise<Bed> =>
    apiRequest(`/beds/${id}`),
};

// ==================== MEMBERS API ====================

export const membersApi = {
  listByProperty: (propertyId: string): Promise<Member[]> =>
    apiRequest(`/properties/${propertyId}/members`),

  get: (id: string): Promise<Member> =>
    apiRequest(`/members/${id}`),

  create: (data: CreateMemberRequest): Promise<Member> =>
    apiRequest('/members', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateMemberRequest): Promise<Member> =>
    apiRequest(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/members/${id}`, { method: 'DELETE' }),

  assignToBed: (memberId: string, bedId: string): Promise<Member> =>
    apiRequest(`/members/${memberId}/assign`, { method: 'POST', body: JSON.stringify({ bed_id: bedId }) }),

  unassignFromBed: (memberId: string): Promise<Member> =>
    apiRequest(`/members/${memberId}/unassign`, { method: 'POST' }),
};

// ==================== PROPERTY WIZARD API ====================

export const wizardApi = {
  createFullProperty: (data: CreateFullPropertyRequest): Promise<CreateFullPropertyResponse> =>
    apiRequest('/properties/wizard', { method: 'POST', body: JSON.stringify(data) }),
};

// ==================== PROPERTY DETAILS API ====================

export const propertyDetailsApi = {
  get: (propertyId: string): Promise<PropertyDetails> =>
    apiRequest(`/properties/${propertyId}/details`),
};
