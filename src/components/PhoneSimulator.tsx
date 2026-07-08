import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  User as UserIcon, 
  CreditCard, 
  Shield, 
  Smartphone, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle, 
  Plus, 
  Clock, 
  HelpCircle, 
  Settings as SettingsIcon, 
  LogOut, 
  Network, 
  Tv, 
  Activity, 
  Lock, 
  Compass, 
  ChevronRight,
  Info,
  Search,
  ChevronDown,
  ChevronUp,
  Bell,
  BellOff,
  X
} from 'lucide-react';
import { AppState, User, Plan, Subscription, Payment } from '../types';

interface PhoneSimulatorProps {
  state: AppState;
  updateState: (newState: AppState) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export default function PhoneSimulator({ state, updateState, currentUser, setCurrentUser }: PhoneSimulatorProps) {
  // Mobile navigation router states
  // 'splash' | 'welcome' | 'register' | 'login' | 'dashboard' | 'plans' | 'payment' | 'success' | 'connection' | 'profile'
  const [currentPage, setCurrentPage] = useState<string>('splash');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Registration and Login form fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [payPhone, setPayPhone] = useState('');
  const [selectedPayMethod, setSelectedPayMethod] = useState<'MTN Mobile Money' | 'Moov Money'>('MTN Mobile Money');

  // Connection/VPN States
  const [isVpnConnected, setIsVpnConnected] = useState(false);
  const [vpnDuration, setVpnDuration] = useState(0); // in seconds
  const [simulatedSpeed, setSimulatedSpeed] = useState({ down: 0, up: 0 });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'plans' | 'connection' | 'profile'>('home');

  // Interactive local remaining time state
  const [remainingTimeText, setRemainingTimeText] = useState('00:00:00');

  // FAQ state variables
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [faqCategory, setFaqCategory] = useState<'all' | 'vpn' | 'momo'>('all');

  // Push Notification States
  interface PushNotification {
    id: string;
    title: string;
    body: string;
    type: 'warning' | 'error' | 'success' | 'info';
    timestamp: Date;
    read: boolean;
  }
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [activeNotification, setActiveNotification] = useState<PushNotification | null>(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Keep track of warning/expired notifications sent for each subscription to prevent duplicates
  const warnedSubIdsRef = useRef<Set<string>>(new Set());
  const expiredSubIdsRef = useRef<Set<string>>(new Set());

  // Web Audio chime player
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12); // A5
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.12, now + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.37);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn('AudioContext not supported or blocked by browser:', e);
    }
  };

  // Helper to trigger and add a notification
  const triggerNotification = (title: string, body: string, type: 'warning' | 'error' | 'success' | 'info') => {
    const newNotif: PushNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title,
      body,
      type,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveNotification(newNotif);
    playNotificationSound();

    // Auto-dismiss the active slide-down banner after 5 seconds
    setTimeout(() => {
      setActiveNotification(prev => prev && prev.id === newNotif.id ? null : prev);
    }, 5000);
  };

  // Time ticks
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const vpnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Splash screen transition timer
  useEffect(() => {
    if (currentPage === 'splash') {
      const timer = setTimeout(() => {
        setCurrentPage('welcome');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  // VPN simulation duration ticks and random speed metrics
  useEffect(() => {
    if (isVpnConnected) {
      vpnTimerRef.current = setInterval(() => {
        setVpnDuration(prev => prev + 1);
        // Random speed updates to make it feel alive!
        setSimulatedSpeed({
          down: parseFloat((25 + Math.random() * 45).toFixed(1)),
          up: parseFloat((8 + Math.random() * 12).toFixed(1))
        });
      }, 1000);
    } else {
      if (vpnTimerRef.current) clearInterval(vpnTimerRef.current);
      setVpnDuration(0);
      setSimulatedSpeed({ down: 0, up: 0 });
    }
    return () => {
      if (vpnTimerRef.current) clearInterval(vpnTimerRef.current);
    };
  }, [isVpnConnected]);

  // Active subscription remaining time calculation
  useEffect(() => {
    const calcRemainingTime = () => {
      if (!currentUser) {
        setRemainingTimeText('00:00:00');
        return;
      }

      // Find active subscription for current user
      const userSub = state.subscriptions.find(
        sub => sub.user_id === currentUser.id && sub.status === 'active'
      );

      if (!userSub) {
        setRemainingTimeText('00:00:00');
        return;
      }

      const now = new Date().getTime();
      const end = new Date(userSub.end_date).getTime();
      const diff = end - now;

      // Trigger warning notification if less than 10 seconds remain
      if (diff <= 10000 && diff > 0) {
        if (!warnedSubIdsRef.current.has(userSub.id)) {
          warnedSubIdsRef.current.add(userSub.id);
          const plan = state.plans.find(p => p.id === userSub.plan_id);
          const planName = plan ? plan.name : 'Pass Illimité';
          triggerNotification(
            "⚠️ Expiration de Forfait Proche",
            `Votre forfait "${planName}" expire dans moins de 10 secondes ! Renouvelez pour conserver votre connexion VPN.`,
            "warning"
          );
        }
      }

      if (diff <= 0) {
        if (!expiredSubIdsRef.current.has(userSub.id)) {
          expiredSubIdsRef.current.add(userSub.id);
          const plan = state.plans.find(p => p.id === userSub.plan_id);
          const planName = plan ? plan.name : 'Pass Illimité';
          triggerNotification(
            "🔴 Forfait Internet Expiré",
            `Votre forfait "${planName}" a expiré. Votre connexion VPN a été coupée pour éviter tout hors-forfait.`,
            "error"
          );
        }

        // Mark subscription expired in state automatically
        const updatedSubs = state.subscriptions.map(s => {
          if (s.id === userSub.id) {
            return { ...s, status: 'expired' as const };
          }
          return s;
        });
        updateState({
          ...state,
          subscriptions: updatedSubs
        });
        setRemainingTimeText('Expiré');
        setIsVpnConnected(false); // Disconnect VPN if expired
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const hrsStr = hrs.toString().padStart(2, '0');
      const minsStr = mins.toString().padStart(2, '0');
      const secsStr = secs.toString().padStart(2, '0');

      setRemainingTimeText(`${hrsStr}:${minsStr}:${secsStr}`);
    };

    calcRemainingTime();
    timerRef.current = setInterval(calcRemainingTime, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, currentUser, updateState]);

  // Retrieve current active plan name for the user
  const getActivePlanName = () => {
    if (!currentUser) return null;
    const activeSub = state.subscriptions.find(
      sub => sub.user_id === currentUser.id && sub.status === 'active'
    );
    if (!activeSub) return null;
    const plan = state.plans.find(p => p.id === activeSub.plan_id);
    return plan ? plan.name : 'Pass Illimité';
  };

  const getActiveSubscription = () => {
    if (!currentUser) return null;
    return state.subscriptions.find(
      sub => sub.user_id === currentUser.id && sub.status === 'active'
    ) || null;
  };

  // Auth: Register Action
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      alert('Veuillez remplir le nom et le numéro de téléphone.');
      return;
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      full_name: regName,
      phone_number: regPhone.startsWith('+229') ? regPhone : '+229 ' + regPhone,
      created_at: new Date().toISOString(),
      status: 'active'
    };

    const updatedUsers = [...state.users, newUser];
    updateState({
      ...state,
      users: updatedUsers
    });

    setCurrentUser(newUser);
    // Clear forms
    setRegName('');
    setRegPhone('');
    setRegOtp('');
    
    // Set view to home
    setActiveTab('home');
    setCurrentPage('dashboard');
  };

  // Auth: Login Action
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      alert('Veuillez entrer votre numéro de téléphone.');
      return;
    }

    // Try to find user with similar phone number or exact
    const formattedPhone = loginPhone.replace(/\s+/g, '');
    const user = state.users.find(u => {
      const uPhoneClean = u.phone_number.replace(/\s+/g, '');
      return uPhoneClean.includes(formattedPhone) || formattedPhone.includes(uPhoneClean);
    });

    if (user) {
      if (user.status === 'suspended') {
        alert('Votre compte est suspendu. Veuillez contacter le support.');
        return;
      }
      setCurrentUser(user);
      setActiveTab('home');
      setCurrentPage('dashboard');
    } else {
      // Create auto-demo user for convenience if user not found, or prompt creation
      const confirmDemo = window.confirm(
        `Aucun compte trouvé pour "${loginPhone}". Souhaitez-vous créer un nouveau compte de démonstration ?`
      );
      if (confirmDemo) {
        const newUser: User = {
          id: 'user-' + Date.now(),
          full_name: 'Utilisateur Bénin',
          phone_number: loginPhone.startsWith('+229') ? loginPhone : '+229 ' + loginPhone,
          created_at: new Date().toISOString(),
          status: 'active'
        };
        updateState({ ...state, users: [...state.users, newUser] });
        setCurrentUser(newUser);
        setActiveTab('home');
        setCurrentPage('dashboard');
      }
    }
  };

  // Payment: Purchase Action
  const handlePurchase = (plan: Plan) => {
    if (!currentUser) {
      alert('Veuillez vous connecter d\'abord.');
      setCurrentPage('login');
      return;
    }
    setSelectedPlan(plan);
    setPayPhone(currentUser.phone_number);
    setCurrentPage('payment');
  };

  // Payment: Simulate Mobile Money checkout
  const handlePayNow = () => {
    if (!selectedPlan || !currentUser) return;
    
    setIsProcessingPayment(true);
    
    // Simulate Mobile Money backend prompt delay
    setTimeout(() => {
      // 1. Create unique transaction
      const transactionId = `TXN-${selectedPayMethod === 'MTN Mobile Money' ? 'MTN' : 'MOOV'}-${Math.floor(1000000 + Math.random() * 9000000)}`;
      
      const newPayment: Payment = {
        id: 'pay-' + Date.now(),
        user_id: currentUser.id,
        amount: selectedPlan.price,
        payment_method: selectedPayMethod,
        transaction_id: transactionId,
        status: 'success',
        created_at: new Date().toISOString(),
        plan_id: selectedPlan.id
      };

      // 2. Set subscription end date based on plan duration hours
      const now = new Date();
      const end = new Date(now.getTime() + selectedPlan.duration_hours * 60 * 60 * 1000);

      // Expire any existing subscriptions for cleaner dashboard experience
      const updatedSubscriptions = state.subscriptions.map(sub => {
        if (sub.user_id === currentUser.id && sub.status === 'active') {
          return { ...sub, status: 'expired' as const };
        }
        return sub;
      });

      const newSubscription: Subscription = {
        id: 'sub-' + Date.now(),
        user_id: currentUser.id,
        plan_id: selectedPlan.id,
        start_date: now.toISOString(),
        end_date: end.toISOString(),
        status: 'active'
      };

      // 3. Update application state
      updateState({
        ...state,
        payments: [newPayment, ...state.payments],
        subscriptions: [newSubscription, ...updatedSubscriptions]
      });

      setIsProcessingPayment(false);
      setCurrentPage('success');

      // Trigger a push notification for successful plan activation
      triggerNotification(
        "🟢 Forfait Internet Activé !",
        `Votre Pass "${selectedPlan.name}" est actif. Vous pouvez dès maintenant lancer votre connexion VPN sécurisée.`,
        "success"
      );
    }, 2500);
  };

  // Helper: Format price in FCFA (XOF)
  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('fr-FR')} FCFA`;
  };

  // Quick helper to log in with pre-existing account
  const quickDemoLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('home');
    setCurrentPage('dashboard');
  };

  // Quick VPN Toggle action
  const toggleVpn = () => {
    const sub = getActiveSubscription();
    if (!sub) {
      alert("Vous n'avez pas de forfait actif. Veuillez acheter un Pass illimité.");
      setCurrentPage('plans');
      setActiveTab('plans');
      return;
    }
    setIsVpnConnected(prev => !prev);
  };

  return (
    <div className="relative mx-auto w-[380px] h-[780px] bg-slate-950 rounded-[50px] border-4 border-slate-800 shadow-2xl p-3 flex flex-col overflow-hidden select-none">
      
      {/* Physical Smartphone Design Details */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-b-xl z-50 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800"></div>
        <div className="w-12 h-1 bg-slate-800 rounded-full ml-3"></div>
      </div>
      <div className="absolute left-[-6px] top-24 w-1 h-12 bg-slate-800 rounded-r"></div>
      <div className="absolute left-[-6px] top-40 w-1 h-10 bg-slate-800 rounded-r"></div>
      <div className="absolute right-[-6px] top-32 w-1 h-14 bg-slate-800 rounded-l"></div>

      {/* Screen Container */}
      <div className="flex-1 rounded-[38px] bg-slate-50 text-slate-800 overflow-hidden flex flex-col relative font-sans">
        
        {/* Status Bar */}
        <div className="h-10 pt-3 px-6 flex justify-between items-center text-xs font-semibold text-slate-900 bg-transparent z-40">
          <span>16:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-slate-900" />
            <span className="text-[10px]">MTN BJ</span>
            <Wifi className="w-3.5 h-3.5 text-slate-900" />
            <div className="flex items-center gap-0.5">
              <span className="text-[9px]">87%</span>
              <Battery className="w-4 h-3 text-slate-900 rotate-0" />
            </div>
          </div>
        </div>

        {/* Dynamic Pages Rendering */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col">
          
          {/* 1. SPLASH SCREEN */}
          {currentPage === 'splash' && (
            <div className="flex-1 flex flex-col items-center justify-between py-12 text-center bg-gradient-to-b from-blue-900 to-indigo-950 text-white -mx-4 -mt-10 mb-[-16px]">
              <div></div>
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {/* Glowing Pulse Rings */}
                  <div className="absolute -inset-4 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
                  <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg border border-blue-400">
                    <Network className="w-11 h-11 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold font-display tracking-tight text-white">IlimiNetZone</h1>
                <p className="text-blue-200 text-sm mt-2 px-6">{`"Internet illimité, simple et rapide"`}</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                  <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <button 
                  onClick={() => setCurrentPage('welcome')}
                  className="text-xs text-blue-300 font-medium hover:text-white transition-colors bg-white/10 px-4 py-1.5 rounded-full"
                >
                  Passer
                </button>
              </div>
            </div>
          )}

          {/* 2. WELCOME PAGE */}
          {currentPage === 'welcome' && (
            <div className="flex-1 flex flex-col justify-between py-8">
              <div className="flex flex-col items-center text-center mt-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md mb-4 border border-blue-400">
                  <Network className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Bienvenue sur IlimiNetZone</h2>
                <p className="text-slate-500 text-sm mt-3 px-2 leading-relaxed">
                  Profitez d'un accès Internet illimité grâce à nos forfaits simples et rapides. Connectez-vous en toute sécurité partout au Bénin.
                </p>
              </div>

              {/* Demo Quick Accounts Login for convenient testing */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 my-4">
                <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Accès rapide démo (Bénin) :
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {state.users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => quickDemoLogin(u)}
                      className="text-left bg-white border border-slate-200 rounded-lg p-2 hover:bg-blue-100 transition-colors"
                    >
                      <div className="font-bold text-[11px] truncate text-slate-800">{u.full_name}</div>
                      <div className="text-[9px] font-mono text-slate-500">{u.phone_number}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  id="btn-welcome-register"
                  onClick={() => setCurrentPage('register')}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Créer un compte
                </button>
                <button
                  id="btn-welcome-login"
                  onClick={() => setCurrentPage('login')}
                  className="w-full py-3.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-semibold hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Se connecter
                </button>
              </div>
            </div>
          )}

          {/* 3. REGISTER PAGE */}
          {currentPage === 'register' && (
            <div className="flex-1 flex flex-col justify-between py-4">
              <div>
                <button 
                  onClick={() => setCurrentPage('welcome')}
                  className="p-1.5 rounded-full hover:bg-slate-100 self-start mb-4 text-slate-600 flex items-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <h3 className="text-2xl font-bold font-display text-slate-900">Créer mon compte</h3>
                <p className="text-slate-500 text-xs mt-1">Configurez votre accès rapide MTN ou Moov</p>

                <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1.5">Nom Complet</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Jean Gnonlonfoun"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white shadow-inner text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1.5">Numéro de Téléphone (Bénin)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-xs text-slate-400 font-mono font-bold">+229</span>
                      <input 
                        type="tel" 
                        placeholder="97 12 34 56"
                        value={regPhone.replace(/^\+229\s*/, '')}
                        onChange={e => setRegPhone(e.target.value)}
                        className="w-full pl-14 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500 bg-white shadow-inner text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-100 rounded-xl p-3 border border-slate-200">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">Code de Vérification OTP (Simulé)</label>
                    <p className="text-[10px] text-slate-400 mb-2">Un code de test a été pré-rempli pour simuler l'envoi de SMS.</p>
                    <input 
                      type="text" 
                      placeholder="123456"
                      value={regOtp}
                      onChange={e => setRegOtp(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center tracking-widest font-mono text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-colors mt-2"
                  >
                    Créer mon compte
                  </button>
                </form>
              </div>

              <button 
                onClick={() => setCurrentPage('login')}
                className="text-xs text-blue-600 font-medium hover:underline text-center py-2"
              >
                Déjà un compte ? Se connecter
              </button>
            </div>
          )}

          {/* 4. LOGIN PAGE */}
          {currentPage === 'login' && (
            <div className="flex-1 flex flex-col justify-between py-4">
              <div>
                <button 
                  onClick={() => setCurrentPage('welcome')}
                  className="p-1.5 rounded-full hover:bg-slate-100 self-start mb-4 text-slate-600 flex items-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <h3 className="text-2xl font-bold font-display text-slate-900">Connexion</h3>
                <p className="text-slate-500 text-xs mt-1">Accédez à votre espace IlimiNetZone</p>

                <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1.5">Numéro de Téléphone (Bénin)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-xs text-slate-400 font-mono font-bold">+229</span>
                      <input 
                        type="tel" 
                        placeholder="97 12 34 56"
                        value={loginPhone.replace(/^\+229\s*/, '')}
                        onChange={e => setLoginPhone(e.target.value)}
                        className="w-full pl-14 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500 bg-white shadow-inner text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1.5">Mot de passe / OTP</label>
                    <input 
                      type="password" 
                      placeholder="••••••"
                      value={loginOtp}
                      onChange={e => setLoginOtp(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white shadow-inner text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-colors mt-4"
                  >
                    Connexion
                  </button>
                </form>
              </div>

              <div className="text-center py-4">
                <button 
                  onClick={() => setCurrentPage('register')}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  Nouveau utilisateur ? Créer un compte
                </button>
              </div>
            </div>
          )}

          {/* 5. HOME DASHBOARD PAGE */}
          {currentPage === 'dashboard' && currentUser && (
            <div className="flex-1 flex flex-col py-2">
              {/* Header Greeting */}
              <div className="flex items-center justify-between mt-2 mb-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Content de vous revoir !</span>
                  <h4 className="text-lg font-bold text-slate-950 font-display">Bonjour {currentUser.full_name.split(' ')[0]}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNotificationCenter(true)}
                    className="relative w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm active:scale-95"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 text-xs">
                    {currentUser.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              </div>

              {/* Core Subscription Card */}
              {getActiveSubscription() ? (
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden mb-4 border border-emerald-400">
                  <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 text-white px-2 py-0.5 rounded-full">
                        Statut : Forfait Actif
                      </span>
                      <h5 className="text-lg font-bold font-display mt-2">{getActivePlanName()}</h5>
                    </div>
                    <CheckCircle className="w-6 h-6 text-emerald-100" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-[10px] text-emerald-100 block uppercase font-medium">Temps restant</span>
                      <span className="text-xl font-mono font-bold">{remainingTimeText}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-100 block uppercase font-medium">Fin de validité</span>
                      <span className="text-xs font-semibold">
                        {new Date(getActiveSubscription()!.end_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Simulator Trigger Tool inside Card */}
                  <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center">
                    <span className="text-[9px] text-emerald-100 uppercase tracking-wider font-semibold">Simulation :</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const activeSub = getActiveSubscription();
                        if (activeSub) {
                          const newEndDate = new Date(Date.now() + 15000); // 15 seconds from now
                          const updatedSubs = state.subscriptions.map(s => {
                            if (s.id === activeSub.id) {
                              return { ...s, end_date: newEndDate.toISOString() };
                            }
                            return s;
                          });
                          updateState({
                            ...state,
                            subscriptions: updatedSubs
                          });
                          // Reset triggers so they fire again for this subscription
                          warnedSubIdsRef.current.delete(activeSub.id);
                          expiredSubIdsRef.current.delete(activeSub.id);
                          
                          // Trigger initial info notification
                          triggerNotification(
                            "⚡ Simulation Démarrée",
                            "La validité de votre forfait a été réduite à 15 secondes pour tester les alertes push d'expiration.",
                            "info"
                          );
                        }
                      }}
                      className="px-2.5 py-1.5 bg-white/15 hover:bg-white/25 border border-white/10 text-white text-[9px] font-bold rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider shadow-inner active:scale-95"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-200" /> Expirer dans 15s
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden mb-4 border border-slate-600">
                  <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-600 text-slate-200 px-2 py-0.5 rounded-full">
                        Statut : Expiré
                      </span>
                      <h5 className="text-lg font-bold font-display mt-2">Aucun forfait actif</h5>
                    </div>
                    <Lock className="w-5 h-5 text-slate-300" />
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed mb-4">
                    Vous n'avez pas de forfait Internet illimité en cours. Achetez un Pass pour activer la connexion.
                  </p>

                  <button
                    onClick={() => {
                      setCurrentPage('plans');
                      setActiveTab('plans');
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors text-center shadow"
                  >
                    Voir les offres
                  </button>
                </div>
              )}

              {/* Main CTA: CONNECT TO INTERNET */}
              <button
                onClick={() => {
                  setCurrentPage('connection');
                  setActiveTab('connection');
                }}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mb-5 uppercase tracking-wide ${
                  getActiveSubscription()
                    ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                }`}
              >
                <Shield className="w-5 h-5" />
                SE CONNECTER À INTERNET
              </button>

              {/* Secondary Navigation Cards */}
              <h6 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">Actions rapides</h6>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    setCurrentPage('plans');
                    setActiveTab('plans');
                  }}
                  className="bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-blue-400 transition-colors shadow-sm flex flex-col justify-between h-20"
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900 block mt-1">Acheter un forfait</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentPage('profile');
                    setActiveTab('profile');
                  }}
                  className="bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-blue-400 transition-colors shadow-sm flex flex-col justify-between h-20"
                >
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900 block mt-1">Historique & Profil</span>
                </button>
              </div>

              {/* Fast Tips Banner */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                <span className="text-lg">⚡</span>
                <p className="text-[10px] text-blue-800 leading-normal">
                  <strong className="font-semibold text-blue-900">Astuce :</strong> Le VPN crypte l'intégralité de vos données mobiles. Activez-le dès que vous êtes connecté à nos infrastructures régionales du Bénin.
                </p>
              </div>
            </div>
          )}

          {/* 6. PLANS PAGE */}
          {currentPage === 'plans' && (
            <div className="flex-1 flex flex-col py-2">
              <div className="mb-4 mt-2">
                <h3 className="text-xl font-bold font-display text-slate-950">Nos Forfaits Illimités</h3>
                <p className="text-slate-500 text-xs">Achetez un pass instantané sans limite de données.</p>
              </div>

              <div className="flex flex-col gap-3">
                {state.plans.map(plan => {
                  const isPopular = plan.id === 'plan-30d';
                  return (
                    <div 
                      key={plan.id}
                      className={`bg-white rounded-xl p-4 border transition-all relative flex flex-col ${
                        isPopular ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-slate-200'
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Populaire
                        </span>
                      )}
                      
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm font-display">{plan.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Durée: {plan.duration}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-blue-600 block">{formatCurrency(plan.price)}</span>
                        </div>
                      </div>

                      <p className="text-slate-500 text-[11px] leading-relaxed mb-3 pr-8">
                        {plan.description}
                      </p>

                      <button
                        onClick={() => handlePurchase(plan)}
                        className={`w-full py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                          isPopular 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        Acheter maintenant
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. PAYMENT PAGE */}
          {currentPage === 'payment' && selectedPlan && currentUser && (
            <div className="flex-1 flex flex-col justify-between py-2">
              <div>
                <button 
                  onClick={() => {
                    setCurrentPage('plans');
                    setActiveTab('plans');
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 self-start mb-2 text-slate-600 flex items-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour aux forfaits
                </button>
                <h3 className="text-xl font-bold font-display text-slate-950">Paiement Mobile Money</h3>
                <p className="text-slate-500 text-xs">Complétez votre transaction en toute sécurité</p>

                {/* Selected Plan Summary Card */}
                <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 my-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Forfait sélectionné</span>
                    <strong className="text-xs text-slate-800">{selectedPlan.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Montant</span>
                    <strong className="text-xs text-blue-600">{formatCurrency(selectedPlan.price)}</strong>
                  </div>
                </div>

                {/* Payment method selection */}
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-2">
                  Opérateur Mobile Money Bénin
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod('MTN Mobile Money')}
                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedPayMethod === 'MTN Mobile Money'
                        ? 'border-yellow-500 bg-yellow-50/50 ring-2 ring-yellow-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-slate-900 text-xs shadow-sm">
                      MTN
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">MTN MoMo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod('Moov Money')}
                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedPayMethod === 'Moov Money'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-[10px] shadow-sm">
                      Moov
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Moov Money</span>
                  </button>
                </div>

                {/* Mobile Money Phone Input */}
                <div className="mb-4">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1.5">
                    Numéro Mobile Money du paiement
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-slate-400 font-mono font-bold">+229</span>
                    <input 
                      type="tel" 
                      placeholder="97 12 34 56"
                      value={payPhone.replace(/^\+229\s*/, '')}
                      onChange={e => setPayPhone(e.target.value)}
                      className="w-full pl-14 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500 bg-white shadow-inner text-slate-800"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-800 leading-relaxed mb-4">
                  Pour valider le paiement, assurez-vous d'avoir votre téléphone à portée de main. Une notification USSD s'affichera pour saisir votre code PIN secret de retrait.
                </div>
              </div>

              {/* Submit Payment CTA */}
              <div>
                {isProcessingPayment ? (
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-slate-800 animate-pulse">
                      Approbation USSD requise...
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Saisissez votre code PIN MoMo sur le terminal pour autoriser le retrait de {formatCurrency(selectedPlan.price)}.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handlePayNow}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors text-sm"
                  >
                    Payer {formatCurrency(selectedPlan.price)}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 7b. SUCCESS PAGE */}
          {currentPage === 'success' && selectedPlan && (
            <div className="flex-1 flex flex-col justify-between py-6 text-center">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-600 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-display">Paiement réussi</h3>
                <p className="text-slate-500 text-xs mt-2 px-4 leading-relaxed">
                  Votre abonnement <strong className="text-slate-800">{selectedPlan.name}</strong> a été activé avec succès au Bénin.
                </p>

                <div className="mt-6 bg-slate-100 p-4 rounded-xl border border-slate-200 text-left w-full">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span>TRANSACTION ID</span>
                    <span className="font-mono text-slate-800 font-bold">TXN-MOMO-{Date.now().toString().slice(-6)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span>OPÉRATEUR</span>
                    <span className="text-slate-800 font-bold">{selectedPayMethod}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>DURÉE ACTIVE</span>
                    <span className="text-slate-800 font-bold">{selectedPlan.duration}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentPage('connection');
                  setActiveTab('connection');
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition-colors text-sm mt-4 uppercase tracking-wider"
              >
                Activer Internet
              </button>
            </div>
          )}

          {/* 8. CONNECTION PAGE (VPN/WIFI style UI) */}
          {currentPage === 'connection' && (
            <div className="flex-1 flex flex-col justify-between py-2">
              <div className="text-center mt-2">
                <h3 className="text-xl font-bold font-display text-slate-950">IlimiNetZone Secure</h3>
                <p className="text-slate-500 text-xs">Réseau sécurisé et illimité du Bénin</p>
              </div>

              {/* Status Graphic */}
              <div className="flex-1 flex flex-col items-center justify-center my-4">
                <div className="relative flex items-center justify-center w-48 h-48">
                  {/* Outer glowing rings if connected */}
                  {isVpnConnected && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-emerald-500/20 pulse-ring-animation"></div>
                      <div className="absolute inset-4 rounded-full bg-emerald-500/30 pulse-ring-animation" style={{ animationDelay: '0.6s' }}></div>
                      <div className="absolute inset-8 rounded-full bg-emerald-500/40 pulse-ring-animation" style={{ animationDelay: '1.2s' }}></div>
                    </>
                  )}
                  
                  {/* Central Button */}
                  <button
                    onClick={toggleVpn}
                    className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 shadow-lg z-10 ${
                      isVpnConnected 
                        ? 'bg-gradient-to-tr from-emerald-500 to-green-600 border-emerald-300 text-white shadow-emerald-200 scale-105' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 shadow-inner'
                    }`}
                  >
                    <Network className={`w-14 h-14 mb-1 transition-transform ${isVpnConnected ? 'scale-110 animate-pulse' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {isVpnConnected ? 'Connecté' : 'DÉCONNECTÉ'}
                    </span>
                  </button>
                </div>

                {/* Speed Network Metrics */}
                {isVpnConnected && (
                  <div className="grid grid-cols-2 gap-8 w-full px-6 mt-4 text-center">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                      <span className="text-[9px] text-emerald-600 uppercase font-bold block mb-0.5">DÉBIT DESCENDANT</span>
                      <strong className="text-sm text-emerald-800 font-mono">{simulatedSpeed.down} Mbps</strong>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                      <span className="text-[9px] text-emerald-600 uppercase font-bold block mb-0.5">DÉBIT MONTANT</span>
                      <strong className="text-sm text-emerald-800 font-mono">{simulatedSpeed.up} Mbps</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Plan Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-2.5">
                  <span className="text-xs text-slate-400 font-medium">Forfait Actif :</span>
                  <span className="text-xs font-bold text-slate-800">{getActivePlanName() || 'Aucun'}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-2.5">
                  <span className="text-xs text-slate-400 font-medium">Temps Restant :</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{remainingTimeText}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Durée de Connexion :</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {isVpnConnected
                      ? `${Math.floor(vpnDuration / 60).toString().padStart(2, '0')}:${(vpnDuration % 60).toString().padStart(2, '0')}`
                      : '00:00'
                    }
                  </span>
                </div>
              </div>

              {/* Quick Toggle Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const sub = getActiveSubscription();
                    if (!sub) {
                      alert("Vous n'avez pas de forfait actif.");
                      return;
                    }
                    setIsVpnConnected(true);
                  }}
                  disabled={!getActiveSubscription() || isVpnConnected}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                    getActiveSubscription() && !isVpnConnected
                      ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700 shadow'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  onClick={() => setIsVpnConnected(false)}
                  disabled={!isVpnConnected}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                    isVpnConnected
                      ? 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300 shadow'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          )}

          {/* 9. PROFILE PAGE */}
          {currentPage === 'profile' && currentUser && (
            <div className="flex-1 flex flex-col py-2">
              {/* User Identity */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm mb-4 flex items-center gap-3 -mx-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center font-bold text-white border border-blue-400">
                  {currentUser.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white font-display leading-tight">{currentUser.full_name}</h4>
                  <span className="text-[10px] font-mono text-blue-200">{currentUser.phone_number}</span>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-400">Compte Actif</span>
                  </div>
                </div>
              </div>

              {/* Subscriptions History List */}
              <h5 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">Mes Forfaits Récents</h5>
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-4 max-h-36 overflow-y-auto">
                {state.subscriptions.filter(sub => sub.user_id === currentUser.id).length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-4">Aucun historique d'abonnement.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {state.subscriptions
                      .filter(sub => sub.user_id === currentUser.id)
                      .map(sub => {
                        const plan = state.plans.find(p => p.id === sub.plan_id);
                        return (
                          <div key={sub.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                            <div>
                              <strong className="text-slate-800 block text-[11px]">{plan ? plan.name : 'Pass Illimité'}</strong>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(sub.start_date).toLocaleDateString('fr-FR')} - {new Date(sub.end_date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                              sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {sub.status === 'active' ? 'Actif' : 'Expiré'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Payments History */}
              <h5 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">Historique des Paiements</h5>
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-4 max-h-36 overflow-y-auto">
                {state.payments.filter(p => p.user_id === currentUser.id).length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-4">Aucun paiement enregistré.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {state.payments
                      .filter(p => p.user_id === currentUser.id)
                      .map(pay => (
                        <div key={pay.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                          <div>
                            <strong className="text-slate-800 text-[11px] block">{formatCurrency(pay.amount)}</strong>
                            <span className="text-[9px] text-slate-400 font-mono">{pay.transaction_id}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 block">{pay.payment_method}</span>
                            <span className="text-[9px] font-bold text-emerald-600">Réussi</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* App Settings list */}
              <h5 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">Support & Paramètres</h5>
              <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm mb-4">
                <button 
                  onClick={() => {
                    setFaqCategory('all');
                    setExpandedFaq(null);
                    setCurrentPage('faq');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-500" /> Centre d'aide & FAQ
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button 
                  onClick={() => {
                    setFaqCategory('vpn');
                    setExpandedFaq(null);
                    setCurrentPage('faq');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between border-t border-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-slate-500" /> Configurer Tunnel VPN
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button 
                  onClick={() => {
                    setCurrentUser(null);
                    setCurrentPage('welcome');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-between border-t border-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-rose-500" /> Se déconnecter
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            </div>
          )}

          {/* 9b. FAQ & HELP CENTER PAGE */}
          {currentPage === 'faq' && (
            <div className="flex-1 flex flex-col py-2">
              {/* FAQ Header */}
              <div className="flex items-center gap-2.5 mb-4 mt-2">
                <button 
                  onClick={() => {
                    setCurrentPage('profile');
                    setActiveTab('profile');
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors flex items-center justify-center border border-slate-200 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-950 leading-tight">Centre d'aide & FAQ</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Assistance IlimiNetZone Bénin</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Rechercher une question ou un mot-clé..."
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 shadow-sm text-slate-800 placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex gap-1.5 mb-4 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setFaqCategory('all');
                    setExpandedFaq(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                    faqCategory === 'all'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                  }`}
                >
                  Tout
                </button>
                <button
                  onClick={() => {
                    setFaqCategory('vpn');
                    setExpandedFaq(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                    faqCategory === 'vpn'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                  }`}
                >
                  Tunnel VPN
                </button>
                <button
                  onClick={() => {
                    setFaqCategory('momo');
                    setExpandedFaq(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                    faqCategory === 'momo'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                  }`}
                >
                  Mobile Money
                </button>
              </div>

              {/* Collapsible FAQ list */}
              <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-2.5 max-h-[360px]">
                {(() => {
                  const FAQ_ITEMS = [
                    {
                      id: 1,
                      question: "Comment activer mon forfait IlimiNetZone ?",
                      answer: "Pour démarrer votre accès illimité, rendez-vous dans l'onglet 'Forfaits', sélectionnez l'offre qui vous convient (24H, 7J ou 30J), puis cliquez sur 'Acheter maintenant'. Renseignez votre numéro de paiement (MTN ou Moov) et validez la notification USSD reçue sur votre téléphone. Une fois validée, accédez à l'onglet 'Connexion' et cliquez sur le gros bouton central pour lancer votre connexion VPN sécurisée.",
                      category: 'vpn' as const
                    },
                    {
                      id: 2,
                      question: "Comment configurer le VPN sur mon smartphone ?",
                      answer: "IlimiNetZone intègre une configuration automatique zéro-clic ! Le client VPN est configuré directement au sein de l'application. Lors du premier clic sur 'Se connecter' (onglet Connexion), votre téléphone (Android ou iOS) vous demandera d'approuver l'autorisation de connexion VPN. Cliquez sur 'Autoriser' ou 'OK'. Dès que l'icône de clé ou de VPN apparaît dans votre barre de statut supérieure, vous naviguez de façon sécurisée.",
                      category: 'vpn' as const
                    },
                    {
                      id: 3,
                      question: "Quels sont les paramètres VPN manuels (OpenVPN/WireGuard) ?",
                      answer: "Si vous préférez utiliser un client système externe comme OpenVPN ou WireGuard : \n• Serveur Gateway Bénin : bj.ilimi.net\n• Protocole : UDP (port 51820) ou TCP (port 443)\n• Chiffrement : AES-256-GCM\n• Nom d'utilisateur : votre numéro béninois enregistré.\nVous pouvez télécharger vos fichiers de profil .ovpn ou .conf personnalisés directement depuis notre espace technique ou notre portail d'assistance.",
                      category: 'vpn' as const
                    },
                    {
                      id: 4,
                      question: "Quels modes de paiement Mobile Money sont acceptés ?",
                      answer: "Nous acceptons les deux principaux réseaux mobiles de paiement au Bénin :\n1. MTN Mobile Money (MoMo) : Repérable à sa couleur jaune.\n2. Moov Money (Flooz) : Repérable à sa couleur verte.\nLes paiements sont traités en toute sécurité via des passerelles locales conformes aux normes réglementaires en vigueur.",
                      category: 'momo' as const
                    },
                    {
                      id: 5,
                      question: "Comment valider mon paiement MTN Mobile Money ?",
                      answer: "Lorsque vous lancez un achat avec MTN MoMo :\n1. Attendez l'apparition de l'invite de saisie de code PIN USSD (Push) sur l'écran de votre téléphone.\n2. Saisissez votre code secret MTN MoMo pour valider le montant requis.\n3. Si le prompt n'apparaît pas, composez manuellement le *122# (Option 'Transactions en attente') pour approuver et débloquer votre achat.",
                      category: 'momo' as const
                    },
                    {
                      id: 6,
                      question: "Comment valider mon paiement Moov Money ?",
                      answer: "Pour les transactions via Moov Money :\n1. Une notification automatique Push s'affichera sur votre écran vous demandant de confirmer l'achat.\n2. Si vous ne recevez pas l'invite, composez le *155# puis naviguez dans le menu d'approbation pour confirmer la transaction et finaliser le paiement du forfait illimité.",
                      category: 'momo' as const
                    },
                    {
                      id: 7,
                      question: "Pourquoi ma connexion VPN refuse-t-elle de se connecter ?",
                      answer: "Si le bouton reste au statut déconnecté, vérifiez :\n1. Que vous avez un forfait illimité actif (visuel vert sur votre page d'accueil).\n2. Que vos données mobiles locales (MTN/Moov) sont bien activées.\n3. Que le signal réseau est suffisant. En cas de blocage persistant, désactivez puis réactivez votre connexion réseau ou contactez notre support technique gratuit.",
                      category: 'vpn' as const
                    },
                    {
                      id: 8,
                      question: "J'ai été débité mais mon forfait est toujours inactif, que faire ?",
                      answer: "Les paiements par Mobile Money sont généralement confirmés en moins d'une minute. Si le forfait ne s'actualise pas instantanément, tirez l'écran d'accueil vers le bas pour forcer la mise à jour des abonnements. Vous pouvez aussi consulter le tableau de bord Administrateur de cette démo pour vérifier ou forcer l'activation de votre transaction si nécessaire.",
                      category: 'momo' as const
                    }
                  ];

                  const filteredFaq = FAQ_ITEMS.filter(item => {
                    const matchesCategory = faqCategory === 'all' || item.category === faqCategory;
                    const matchesSearch = item.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
                                          item.answer.toLowerCase().includes(faqSearchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  });

                  if (filteredFaq.length === 0) {
                    return (
                      <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl p-4">
                        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span className="text-xs font-bold text-slate-700 block">Aucun résultat</span>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          Aucune question ne correspond à "{faqSearchQuery}". Essayez avec d'autres termes comme "VPN", "MoMo", "MTN", "Moov" ou "USSD".
                        </p>
                      </div>
                    );
                  }

                  return filteredFaq.map(item => {
                    const isExpanded = expandedFaq === item.id;
                    return (
                      <div 
                        key={item.id} 
                        className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
                          isExpanded ? 'border-blue-300 shadow-sm ring-1 ring-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : item.id)}
                          className="w-full text-left px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-[11px] font-bold text-slate-800 leading-snug">{item.question}</span>
                          <span className="p-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="px-3.5 pb-3 pt-1 text-slate-600 text-[10px] leading-relaxed border-t border-slate-100 bg-slate-50/40 whitespace-pre-line">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Quick Action Contact Banner */}
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📞</span>
                  <div>
                    <span className="text-[9px] font-bold text-blue-900 block">Assistance Téléphonique</span>
                    <span className="text-[8px] text-blue-700">Disponible 24h/24 et 7j/7</span>
                  </div>
                </div>
                <button 
                  onClick={() => alert("Appel vers le service client d'IlimiNetZone: +229 97 00 00 00 (Simulé)")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold px-2.5 py-1 rounded-lg shadow-sm transition-colors"
                >
                  Appeler
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 10. BOTTOM NAVIGATION BAR */}
        {['dashboard', 'plans', 'connection', 'profile', 'faq'].includes(currentPage) && (
          <div className="h-16 border-t border-slate-200 bg-white px-4 flex items-center justify-between text-slate-400 z-30">
            <button
              onClick={() => {
                setCurrentPage('dashboard');
                setActiveTab('home');
              }}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors ${
                activeTab === 'home' ? 'text-blue-600' : 'hover:text-slate-700'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-[9px] font-bold">Accueil</span>
            </button>

            <button
              onClick={() => {
                setCurrentPage('plans');
                setActiveTab('plans');
              }}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors ${
                activeTab === 'plans' ? 'text-blue-600' : 'hover:text-slate-700'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-[9px] font-bold">Forfaits</span>
            </button>

            <button
              onClick={() => {
                setCurrentPage('connection');
                setActiveTab('connection');
              }}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors ${
                activeTab === 'connection' ? 'text-blue-600' : 'hover:text-slate-700'
              }`}
            >
              <Network className="w-5 h-5" />
              <span className="text-[9px] font-bold">Connexion</span>
            </button>

            <button
              onClick={() => {
                setCurrentPage('profile');
                setActiveTab('profile');
              }}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors ${
                activeTab === 'profile' ? 'text-blue-600' : 'hover:text-slate-700'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[9px] font-bold">Profil</span>
            </button>
          </div>
        )}

        {/* --- SIMULATED PUSH NOTIFICATIONS SYSTEM --- */}

        {/* 1. Active Slide-Down Push Notification Banner */}
        {activeNotification && (
          <div 
            className="absolute top-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-200 z-50 flex items-start gap-3 transition-all duration-300 transform translate-y-0 animate-in slide-in-from-top-12 cursor-pointer hover:bg-slate-50"
            onClick={() => {
              // Click to navigate to the Plans renewal page
              setCurrentPage('plans');
              setActiveTab('plans');
              setActiveNotification(null);
              // Mark as read in history
              setNotifications(prev => prev.map(n => n.id === activeNotification.id ? { ...n, read: true } : n));
            }}
          >
            {/* App Icon Container */}
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white shadow-sm ${
              activeNotification.type === 'warning' ? 'bg-amber-500' :
              activeNotification.type === 'error' ? 'bg-rose-500' :
              activeNotification.type === 'success' ? 'bg-emerald-500' : 'bg-blue-600'
            }`}>
              <Network className="w-4 h-4 animate-pulse" />
            </div>
            
            {/* Notification Text Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IlimiNetZone</span>
                <span className="text-[9px] text-slate-400 font-medium">Maintenant</span>
              </div>
              <h5 className="text-[11px] font-bold text-slate-950 mt-0.5 leading-tight">{activeNotification.title}</h5>
              <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{activeNotification.body}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveNotification(null);
              }}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors self-start"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Notification Center Drawer / Overlay */}
        {showNotificationCenter && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity flex flex-col justify-end">
            <div className="bg-slate-50 rounded-t-[32px] max-h-[85%] flex flex-col p-4 animate-in slide-in-from-bottom-24 duration-300 shadow-2xl border-t border-slate-200">
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                    <Bell className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 font-display">Centre de Notifications</h4>
                    <p className="text-[9px] text-slate-400 font-medium">Alertes système & rappels</p>
                  </div>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>

              {/* Notification List Body */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-0.5 pb-4 min-h-[280px]">
                {notifications.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <BellOff className="w-10 h-10 text-slate-300 mb-2.5" />
                    <span className="text-xs font-bold text-slate-700">Aucune notification</span>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-normal">
                      Les alertes de déconnexion et de fin de forfait s'afficheront ici en temps réel.
                    </p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        if (notif.type === 'warning' || notif.type === 'error') {
                          setCurrentPage('plans');
                          setActiveTab('plans');
                        }
                        // Mark as read
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                        setShowNotificationCenter(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 hover:border-slate-300 hover:shadow-sm ${
                        notif.read ? 'bg-white border-slate-200/60' : 'bg-blue-50/40 border-blue-150 ring-1 ring-blue-50/50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-white shadow-sm ${
                        notif.type === 'warning' ? 'bg-amber-500' :
                        notif.type === 'error' ? 'bg-rose-500' :
                        notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}>
                        <Network className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-bold text-slate-800 truncate">{notif.title}</span>
                          <span className="text-[8px] text-slate-400 font-mono">
                            {new Date(notif.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1 leading-normal">{notif.body}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-200/60 shrink-0">
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      setNotifications([]);
                      setShowNotificationCenter(false);
                    }}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors border border-rose-100"
                  >
                    Effacer l'historique
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
