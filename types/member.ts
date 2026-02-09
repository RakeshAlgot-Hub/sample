export interface Member {
  id: string;
  name: string;
  phone: string;
  villageName?: string;
  joinedDate?: string;
  payDate?: string;
  paymentCycle?: number;
  nextDueDate?: string;
  proofId?: string;
  profilePic?: string | null;
  propertyId?: string;
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  bedId?: string;
  createdAt: string;
}
