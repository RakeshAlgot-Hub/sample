export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  method?: string;
  status?: string;
  notes?: string;
  createdAt: string;
}
