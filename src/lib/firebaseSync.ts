import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AppState, User, Plan, Subscription, Payment } from '../types';
import { INITIAL_PLANS, INITIAL_USERS, INITIAL_SUBSCRIPTIONS, INITIAL_PAYMENTS } from '../data/mockData';

// References to Firestore collections
const usersCol = collection(db, 'users');
const plansCol = collection(db, 'plans');
const subsCol = collection(db, 'subscriptions');
const paymentsCol = collection(db, 'payments');

/**
 * Seeds Firestore with default mock data if collections are empty.
 */
export async function seedFirestoreIfEmpty() {
  try {
    // Check plans
    const plansSnap = await getDocs(plansCol);
    if (plansSnap.empty) {
      console.log('Seeding plans into Firestore...');
      const batch = writeBatch(db);
      INITIAL_PLANS.forEach(plan => {
        const planRef = doc(plansCol, plan.id);
        batch.set(planRef, plan);
      });
      await batch.commit();
    }

    // Check users
    const usersSnap = await getDocs(usersCol);
    if (usersSnap.empty) {
      console.log('Seeding users into Firestore...');
      const batch = writeBatch(db);
      INITIAL_USERS.forEach(user => {
        const userRef = doc(usersCol, user.id);
        batch.set(userRef, user);
      });
      await batch.commit();
    }

    // Check subscriptions
    const subsSnap = await getDocs(subsCol);
    if (subsSnap.empty) {
      console.log('Seeding subscriptions into Firestore...');
      const batch = writeBatch(db);
      INITIAL_SUBSCRIPTIONS.forEach(sub => {
        const subRef = doc(subsCol, sub.id);
        batch.set(subRef, sub);
      });
      await batch.commit();
    }

    // Check payments
    const paymentsSnap = await getDocs(paymentsCol);
    if (paymentsSnap.empty) {
      console.log('Seeding payments into Firestore...');
      const batch = writeBatch(db);
      INITIAL_PAYMENTS.forEach(pay => {
        const payRef = doc(paymentsCol, pay.id);
        batch.set(payRef, pay);
      });
      await batch.commit();
    }
    
    console.log('Firestore database check / seeding completed successfully!');
  } catch (err) {
    console.error('Error during Firestore seeding:', err);
  }
}

/**
 * Set up real-time listener for the complete database state.
 */
export function listenToFirebaseState(onUpdate: (state: AppState) => void) {
  let currentUsers: User[] = [];
  let currentPlans: Plan[] = [];
  let currentSubs: Subscription[] = [];
  let currentPayments: Payment[] = [];

  const triggerUpdate = () => {
    // Sort plans by price or ID for consistency
    const sortedPlans = [...currentPlans].sort((a, b) => a.price - b.price);
    // Sort payments by creation date descending
    const sortedPayments = [...currentPayments].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    // Sort subscriptions by start date descending
    const sortedSubs = [...currentSubs].sort((a, b) => 
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    onUpdate({
      users: currentUsers,
      plans: sortedPlans,
      subscriptions: sortedSubs,
      payments: sortedPayments
    });
  };

  // 1. Listen to Users
  const unsubUsers = onSnapshot(usersCol, (snapshot) => {
    currentUsers = snapshot.docs.map(doc => doc.data() as User);
    triggerUpdate();
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'users');
  });

  // 2. Listen to Plans
  const unsubPlans = onSnapshot(plansCol, (snapshot) => {
    currentPlans = snapshot.docs.map(doc => doc.data() as Plan);
    triggerUpdate();
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'plans');
  });

  // 3. Listen to Subscriptions
  const unsubSubs = onSnapshot(subsCol, (snapshot) => {
    currentSubs = snapshot.docs.map(doc => doc.data() as Subscription);
    triggerUpdate();
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'subscriptions');
  });

  // 4. Listen to Payments
  const unsubPayments = onSnapshot(paymentsCol, (snapshot) => {
    currentPayments = snapshot.docs.map(doc => doc.data() as Payment);
    triggerUpdate();
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'payments');
  });

  // Return a single function to unsubscribe all listeners
  return () => {
    unsubUsers();
    unsubPlans();
    unsubSubs();
    unsubPayments();
  };
}

/**
 * Create or Update a User in Firestore
 */
export async function saveUserInFirestore(user: User) {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
  }
}

/**
 * Create or Update a Plan in Firestore
 */
export async function savePlanInFirestore(plan: Plan) {
  try {
    const planRef = doc(db, 'plans', plan.id);
    await setDoc(planRef, plan);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `plans/${plan.id}`);
  }
}

/**
 * Create or Update a Subscription in Firestore
 */
export async function saveSubscriptionInFirestore(sub: Subscription) {
  try {
    const subRef = doc(db, 'subscriptions', sub.id);
    await setDoc(subRef, sub);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `subscriptions/${sub.id}`);
  }
}

/**
 * Create or Update a Payment in Firestore
 */
export async function savePaymentInFirestore(pay: Payment) {
  try {
    const payRef = doc(db, 'payments', pay.id);
    await setDoc(payRef, pay);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `payments/${pay.id}`);
  }
}

/**
 * Delete a User and their sub-data in Firestore
 */
export async function deleteUserFromFirestore(userId: string, associatedSubIds: string[], associatedPayIds: string[]) {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);

    // Batch delete associated subscriptions
    for (const subId of associatedSubIds) {
      await deleteDoc(doc(db, 'subscriptions', subId));
    }

    // Batch delete associated payments
    for (const payId of associatedPayIds) {
      await deleteDoc(doc(db, 'payments', payId));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
  }
}

/**
 * Propagate structural state diffs directly to Firestore
 */
export async function syncStateDiffToFirestore(oldState: AppState, newState: AppState) {
  try {
    // 1. Sync Users
    const oldUsersMap = new Map(oldState.users.map(u => [u.id, u]));
    const newUsersMap = new Map(newState.users.map(u => [u.id, u]));

    for (const [id, newUser] of newUsersMap.entries()) {
      const oldUser = oldUsersMap.get(id);
      if (!oldUser || JSON.stringify(oldUser) !== JSON.stringify(newUser)) {
        await saveUserInFirestore(newUser);
      }
    }
    for (const id of oldUsersMap.keys()) {
      if (!newUsersMap.has(id)) {
        const subsToDelete = oldState.subscriptions.filter(s => s.user_id === id).map(s => s.id);
        const paysToDelete = oldState.payments.filter(p => p.user_id === id).map(p => p.id);
        await deleteUserFromFirestore(id, subsToDelete, paysToDelete);
      }
    }

    // 2. Sync Plans
    const oldPlansMap = new Map(oldState.plans.map(p => [p.id, p]));
    const newPlansMap = new Map(newState.plans.map(p => [p.id, p]));

    for (const [id, newPlan] of newPlansMap.entries()) {
      const oldPlan = oldPlansMap.get(id);
      if (!oldPlan || JSON.stringify(oldPlan) !== JSON.stringify(newPlan)) {
        await savePlanInFirestore(newPlan);
      }
    }
    for (const id of oldPlansMap.keys()) {
      if (!newPlansMap.has(id)) {
        await deleteDoc(doc(db, 'plans', id));
      }
    }

    // 3. Sync Subscriptions
    const oldSubsMap = new Map(oldState.subscriptions.map(s => [s.id, s]));
    const newSubsMap = new Map(newState.subscriptions.map(s => [s.id, s]));

    for (const [id, newSub] of newSubsMap.entries()) {
      const oldSub = oldSubsMap.get(id);
      if (!oldSub || JSON.stringify(oldSub) !== JSON.stringify(newSub)) {
        await saveSubscriptionInFirestore(newSub);
      }
    }
    for (const id of oldSubsMap.keys()) {
      if (!newSubsMap.has(id)) {
        await deleteDoc(doc(db, 'subscriptions', id));
      }
    }

    // 4. Sync Payments
    const oldPaymentsMap = new Map(oldState.payments.map(p => [p.id, p]));
    const newPaymentsMap = new Map(newState.payments.map(p => [p.id, p]));

    for (const [id, newPay] of newPaymentsMap.entries()) {
      const oldPay = oldPaymentsMap.get(id);
      if (!oldPay || JSON.stringify(oldPay) !== JSON.stringify(newPay)) {
        await savePaymentInFirestore(newPay);
      }
    }
    for (const id of oldPaymentsMap.keys()) {
      if (!newPaymentsMap.has(id)) {
        await deleteDoc(doc(db, 'payments', id));
      }
    }
  } catch (err) {
    console.error('Error in syncStateDiffToFirestore:', err);
  }
}
