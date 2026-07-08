import { Plan, User, Subscription, Payment, AppState } from '../types';

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-24h',
    name: 'Pass 24H Illimité',
    price: 250,
    duration: '24 heures',
    duration_hours: 24,
    description: 'Accès Internet illimité sans réduction de vitesse pour 24 heures.',
    active: true,
  },
  {
    id: 'plan-7d',
    name: 'Pass 7 jours Illimité',
    price: 1250,
    duration: '7 jours',
    duration_hours: 168,
    description: 'Accès haut débit illimité pendant une semaine complète au Bénin.',
    active: true,
  },
  {
    id: 'plan-14d',
    name: 'Pass 14 jours Illimité',
    price: 2000,
    duration: '14 jours',
    duration_hours: 336,
    description: 'Forfait bimensuel illimité parfait pour les travailleurs indépendants.',
    active: true,
  },
  {
    id: 'plan-30d',
    name: 'Pass 30 jours Illimité',
    price: 3500,
    duration: '30 jours',
    duration_hours: 720,
    description: 'Le meilleur rapport qualité-prix. Un mois d\'Internet illimité absolu.',
    active: true,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-default',
    full_name: 'Jean Gnonlonfoun',
    phone_number: '+229 97 12 34 56',
    created_at: '2026-07-01T10:00:00Z',
    status: 'active',
  },
  {
    id: 'user-2',
    full_name: 'Amina Soglo',
    phone_number: '+229 95 88 99 00',
    created_at: '2026-07-03T14:20:00Z',
    status: 'active',
  },
  {
    id: 'user-3',
    full_name: 'Koffi Mensah',
    phone_number: '+229 61 45 67 89',
    created_at: '2026-07-05T09:15:00Z',
    status: 'suspended',
  },
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-amina',
    user_id: 'user-2',
    plan_id: 'plan-24h',
    start_date: '2026-07-07T08:00:00Z',
    end_date: '2026-07-08T08:00:00Z',
    status: 'active',
  },
  {
    id: 'sub-koffi',
    user_id: 'user-3',
    plan_id: 'plan-7d',
    start_date: '2026-06-25T12:00:00Z',
    end_date: '2026-07-02T12:00:00Z',
    status: 'expired',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-amina',
    user_id: 'user-2',
    amount: 250,
    payment_method: 'MTN Mobile Money',
    transaction_id: 'TXN-MTN-8849204',
    status: 'success',
    created_at: '2026-07-07T07:55:00Z',
    plan_id: 'plan-24h',
  },
  {
    id: 'pay-koffi',
    user_id: 'user-3',
    amount: 1250,
    payment_method: 'Moov Money',
    transaction_id: 'TXN-MOOV-1123984',
    status: 'success',
    created_at: '2026-06-25T11:58:00Z',
    plan_id: 'plan-7d',
  },
];

const LOCAL_STORAGE_KEY = 'ilimi_netzone_state';

export function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }
  return {
    users: INITIAL_USERS,
    plans: INITIAL_PLANS,
    subscriptions: INITIAL_SUBSCRIPTIONS,
    payments: INITIAL_PAYMENTS,
  };
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}
