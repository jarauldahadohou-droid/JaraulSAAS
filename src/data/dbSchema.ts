export const supabaseSQL = `-- ==========================================
-- SUPABASE / POSTGRESQL SCHEMA FOR ILIMINETZONE
-- ==========================================

-- 1. TABLE: USERS
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')) NOT NULL
);

-- Enable Row Level Security (RLS) for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);


-- 2. TABLE: PLANS
CREATE TABLE public.plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price INT NOT NULL, -- in XOF (FCFA)
    duration INTERVAL NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true NOT NULL
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
    ON public.plans FOR SELECT
    USING (active = true);


-- 3. TABLE: SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired')) NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);


-- 4. TABLE: PAYMENTS
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount INT NOT NULL,
    payment_method TEXT NOT NULL, -- e.g., 'MTN Mobile Money', 'Moov Money'
    transaction_id TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);
`;

export const mobileMoneyIntegrationCode = `// MTN & Moov Mobile Money Benin API Integration Guide
// This can be integrated using Kkiapay, FedaPay, or directly with Operator APIs (MTN Moov).

// Example of FedaPay Node.js Integration (Server-side API Route /api/payment)
import { Transaction } from 'fedapay';

export async function createFedaPayTransaction(amount: number, userPhone: string, userEmail: string) {
  FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
  FedaPay.setEnvironment('live'); // or 'sandbox'

  const transaction = await Transaction.create({
    description: 'Abonnement IlimiNetZone',
    amount: amount,
    currency: { iso: 'XOF' },
    callback_url: 'https://your-domain.com/api/payment-callback',
    customer: {
      firstname: 'Client',
      lastname: 'IlimiNetZone',
      email: userEmail,
      phone_number: {
        number: userPhone,
        country: 'BJ' // Bénin
      }
    }
  });

  const token = await transaction.generateToken();
  return {
    checkout_url: token.url,
    transaction_id: transaction.id
  };
}
`;

export const vpnApiIntegrationCode = `// VPN / Tunnel Connection Architecture for FlutterFlow & Native Code
// For Android: VpnService API
// For iOS: NetworkExtension Framework (NEPacketTunnelProvider)

// We trigger the VPN native bridge from FlutterFlow using Custom Actions.

// 1. Android Native VpnService (Kotlin)
/*
class IlimiVpnService : VpnService() {
    private var mThread: Thread? = null
    private var mInterface: ParcelFileDescriptor? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Establish VPN configuration
        val builder = Builder()
        builder.setSession("IlimiNetZoneTunnel")
        builder.addAddress("10.0.0.2", 32)
        builder.addRoute("0.0.0.0", 0) // Route all internet traffic through the secure gateway
        builder.addDnsServer("8.8.8.8")
        
        // Active key validation checks via auth headers
        mInterface = builder.establish()
        
        // Start secure packet forwarding thread
        return START_STICKY
    }
}
*/

// 2. FlutterFlow Custom Action Bridge
/*
Future<bool> startVpnTunnel(String subscriptionId, String gateWayUrl) async {
  try {
    // Call Native Android/iOS Method Channel
    final bool result = await const MethodChannel('com.ilimi.netzone/vpn')
        .invokeMethod('startVpn', {
          'sub_id': subscriptionId,
          'gateway': gateWayUrl
        });
    return result;
  } catch (e) {
    print("Failed to launch VPN: $e");
    return false;
  }
}
*/
`;
