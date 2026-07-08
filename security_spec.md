# Security Specification for IlimiNetZone

## 1. Data Invariants
- A user document can only be read or written by the authenticated user matching their own `userId`.
- Plans can be read by anyone, but can only be modified by administrators.
- Subscriptions can only be read or written by the user who owns them (`user_id == auth.uid`).
- Payments can only be read or written by the user who owns them (`user_id == auth.uid`).
- A payment cannot transition from terminal states like `success` or `failed` back to `pending`.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Identity Spoofing in Users**: User A attempting to write a user profile with User B's UID.
2. **Ghost Fields in Users**: User A writing a profile with an unapproved extra attribute (`isAdmin: true`).
3. **Impersonation in Subscriptions**: User A creating a subscription resource with `user_id` set to User B's UID.
4. **Subscription Lifetime Spoofing**: User A modifying an existing subscription's `end_date` to bypass expiration controls.
5. **Admin Override in Plans**: A normal authenticated user attempting to create or edit a plan.
6. **Payment Hijacking**: User A creating a payment reference pointing to User B's `user_id`.
7. **Payment State Shortcutting**: User A updating their payment status directly from `pending` to `success` without an actual processed callback.
8. **Resource Poisoning in IDs**: Injecting a 2KB junk character string as the user document ID.
9. **Zero-Amount Payment**: Creating a payment with a zero or negative `amount`.
10. **Plan Deactivation by User**: A normal user deactivating a plan.
11. **Improper Timestamp on creation**: Submitting a payment with a backdated or future `created_at` instead of using the server-side timestamp (`request.time`).
12. **Anonymous Write**: An unauthenticated user trying to write to the `users` collection.

## 3. Test Cases (Verification Blueprint)
These are verified using Jest or standard rule verification processes to ensure all malicious attempts return `PERMISSION_DENIED`.
