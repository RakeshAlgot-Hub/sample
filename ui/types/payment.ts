export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  paymentDate: string;
  method?: string;
  note?: string;
}
