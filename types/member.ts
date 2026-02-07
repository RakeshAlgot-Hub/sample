export interface Member {
  id: string;
  name: string;
  phone: string;
  address?: string;
  city?: string;
  pincode?: string;
  proofId?: string;
  profilePic?: string | null;
  propertyId?: string;
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  bedId?: string;
  bedAmount?: number;
  billingPeriod?: string;
  createdAt: string;
}
