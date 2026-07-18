export type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
export type FulfillmentStatus = 'PREPARING' | 'READY_TO_PICK' | 'SHIPPED' | 'COMPLETED' | 'CANCELED';

export interface Transaction {
  id: string;
  transaction_number: string;
  created_at: string;
  total_amount: number;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
}