export interface User {
  id: string;
  full_name: string;
  phone_number: string;
  created_at: string;
  status: 'active' | 'suspended';
}

export interface Plan {
  id: string;
  name: string;
  price: number; // in FCFA
  duration: string; // e.g., "24 hours", "7 days"
  duration_hours: number;
  description: string;
  active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired';
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_method: 'Mobile Money' | 'Moov Money' | 'MTN Mobile Money';
  transaction_id: string;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
  plan_id: string;
}

export interface AppState {
  users: User[];
  plans: Plan[];
  subscriptions: Subscription[];
  payments: Payment[];
}
