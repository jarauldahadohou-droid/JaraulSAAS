import React, { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  ShieldAlert, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Search, 
  AlertCircle,
  Database,
  BarChart3,
  Percent,
  Activity,
  Edit2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { AppState, User, Plan, Subscription, Payment } from '../types';

interface AdminDashboardProps {
  state: AppState;
  updateState: (newState: AppState) => void;
}

export default function AdminDashboard({ state, updateState }: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'plans' | 'subs' | 'payments' | 'stats'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [planSearch, setPlanSearch] = useState('');
  const [paySearch, setPaySearch] = useState('');

  // Form states to create new User
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Form states to create new Plan
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState(1000);
  const [newPlanDuration, setNewPlanDuration] = useState('5 jours');
  const [newPlanHours, setNewPlanHours] = useState(120);
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);

  // Statistics calculations
  const totalRevenues = state.payments
    .filter(p => p.status === 'success')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeSubscriptionsCount = state.subscriptions.filter(s => s.status === 'active').length;
  const mtnPaymentsCount = state.payments.filter(p => p.payment_method === 'MTN Mobile Money').length;
  const moovPaymentsCount = state.payments.filter(p => p.payment_method === 'Moov Money').length;

  // Actions: Toggle User status (Active vs Suspended)
  const toggleUserStatus = (userId: string) => {
    const updatedUsers = state.users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: u.status === 'active' ? ('suspended' as const) : ('active' as const)
        };
      }
      return u;
    });
    updateState({ ...state, users: updatedUsers });
  };

  // Actions: Delete User
  const deleteUser = (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur et toutes ses données associées ?')) {
      const updatedUsers = state.users.filter(u => u.id !== userId);
      const updatedSubs = state.subscriptions.filter(s => s.user_id !== userId);
      const updatedPayments = state.payments.filter(p => p.user_id !== userId);
      updateState({
        ...state,
        users: updatedUsers,
        subscriptions: updatedSubs,
        payments: updatedPayments
      });
    }
  };

  // Actions: Add User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim()) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    const newUser: User = {
      id: 'user-' + Date.now(),
      full_name: newUserName,
      phone_number: newUserPhone.startsWith('+229') ? newUserPhone : '+229 ' + newUserPhone,
      created_at: new Date().toISOString(),
      status: 'active'
    };
    updateState({ ...state, users: [...state.users, newUser] });
    setNewUserName('');
    setNewUserPhone('');
    setShowAddUserModal(false);
  };

  // Actions: Toggle Plan Active state
  const togglePlanActive = (planId: string) => {
    const updatedPlans = state.plans.map(p => {
      if (p.id === planId) {
        return { ...p, active: !p.active };
      }
      return p;
    });
    updateState({ ...state, plans: updatedPlans });
  };

  // Actions: Add Plan
  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim() || !newPlanDuration.trim()) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    const newPlan: Plan = {
      id: 'plan-' + Date.now(),
      name: newPlanName,
      price: newPlanPrice,
      duration: newPlanDuration,
      duration_hours: newPlanHours,
      description: newPlanDesc || 'Accès Internet illimité haut débit.',
      active: true
    };
    updateState({ ...state, plans: [...state.plans, newPlan] });
    setNewPlanName('');
    setNewPlanPrice(1000);
    setNewPlanDuration('5 jours');
    setNewPlanHours(120);
    setNewPlanDesc('');
    setShowAddPlanModal(false);
  };

  // Filtered queries
  const filteredUsers = state.users.filter(u => 
    u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone_number.includes(userSearch)
  );

  const filteredPlans = state.plans.filter(p =>
    p.name.toLowerCase().includes(planSearch.toLowerCase())
  );

  const filteredPayments = state.payments.filter(p => {
    const user = state.users.find(u => u.id === p.user_id);
    const searchString = paySearch.toLowerCase();
    return (
      p.transaction_id.toLowerCase().includes(searchString) ||
      p.payment_method.toLowerCase().includes(searchString) ||
      (user && user.full_name.toLowerCase().includes(searchString))
    );
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 flex flex-col h-full font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-950/80 border border-blue-900/50 px-2.5 py-1 rounded-md">
            Console Web Admin - IlimiNetZone V1
          </span>
          <h2 className="text-xl font-bold font-display text-white mt-2">Gestion du Réseau & Abonnés</h2>
          <p className="text-slate-400 text-xs mt-1">Supervisez les forfaits, les paiements Mobile Money et l'accès Internet au Bénin.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nouvel Abonné
          </button>
          <button 
            onClick={() => setShowAddPlanModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Créer un Forfait
          </button>
        </div>
      </div>

      {/* Statistics Cards KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Abonnés inscrits</span>
            <span className="text-2xl font-mono font-bold text-white block mt-1">{state.users.length}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Utilisateurs enregistrés</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-900 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Abonnements Actifs</span>
            <span className="text-2xl font-mono font-bold text-emerald-400 block mt-1">{activeSubscriptionsCount}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Tunnels VPN autorisés</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-900 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Revenus Totaux (XOF)</span>
            <span className="text-xl font-mono font-bold text-yellow-500 block mt-1.5">
              {totalRevenues.toLocaleString('fr-FR')} FCFA
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Paiements Mobile Money</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-yellow-950/60 border border-yellow-900 flex items-center justify-center text-yellow-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Répartition Mobile Money</span>
            <span className="text-sm font-semibold text-white block mt-2">
              MTN: {mtnPaymentsCount} | Moov: {moovPaymentsCount}
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Volume de transactions</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-900 flex items-center justify-center text-indigo-400">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 mb-4 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${
            activeSubTab === 'users' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Abonnés ({state.users.length})
        </button>
        <button
          onClick={() => setActiveSubTab('plans')}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${
            activeSubTab === 'plans' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Forfaits ({state.plans.length})
        </button>
        <button
          onClick={() => setActiveSubTab('subs')}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${
            activeSubTab === 'subs' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Abonnements Actifs ({activeSubscriptionsCount})
        </button>
        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${
            activeSubTab === 'payments' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Paiements MoMo ({state.payments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${
            activeSubTab === 'stats' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Analyses & Stats
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto">

        {/* TAB 1: USERS */}
        {activeSubTab === 'users' && (
          <div className="flex flex-col gap-3">
            <div className="relative mb-2">
              <span className="absolute left-3.5 top-2.5 text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Rechercher par nom ou numéro..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-white"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Nom complet</th>
                    <th className="p-3">Numéro Bénin</th>
                    <th className="p-3">Date d'inscription</th>
                    <th className="p-3">Statut VPN</th>
                    <th className="p-3">Action de sécurité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500">Aucun abonné trouvé.</td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      // Check active subscription
                      const hasActiveSub = state.subscriptions.some(
                        sub => sub.user_id === user.id && sub.status === 'active'
                      );

                      return (
                        <tr key={user.id} className="hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-[10px]">
                                {user.full_name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <span className="font-semibold text-white block">{user.full_name}</span>
                                <span className="text-[9px] text-slate-500 font-mono">ID: {user.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-400">{user.phone_number}</td>
                          <td className="p-3 text-slate-400">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide ${
                              user.status === 'suspended'
                                ? 'bg-rose-950 text-rose-400 border border-rose-900'
                                : hasActiveSub
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {user.status === 'suspended' ? 'Suspendu' : hasActiveSub ? 'Connecté' : 'Inactif'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleUserStatus(user.id)}
                                title={user.status === 'active' ? 'Suspendre l\'accès' : 'Activer l\'accès'}
                                className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                                  user.status === 'active' ? 'text-yellow-500' : 'text-emerald-500'
                                }`}
                              >
                                {user.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                title="Supprimer définitivement"
                                className="p-1.5 rounded hover:bg-slate-800 text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PLANS */}
        {activeSubTab === 'plans' && (
          <div className="flex flex-col gap-3">
            <div className="relative mb-2">
              <span className="absolute left-3.5 top-2.5 text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Rechercher un forfait..."
                value={planSearch}
                onChange={e => setPlanSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlans.map(plan => (
                <div key={plan.id} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white text-sm font-display">{plan.name}</h4>
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {plan.price.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-full inline-block mb-3">
                      Durée : {plan.duration} ({plan.duration_hours}h)
                    </span>
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">{plan.description}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800 pt-3 mt-auto">
                    <span className="text-[11px] text-slate-500">Disponibilité Mobile</span>
                    <button
                      onClick={() => togglePlanActive(plan.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                        plan.active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                          : 'bg-rose-950 text-rose-400 border border-rose-900'
                      }`}
                    >
                      {plan.active ? 'Actif' : 'Désactivé'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE SUBSCRIPTIONS */}
        {activeSubTab === 'subs' && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-950/20 rounded-xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Pass Illimité</th>
                    <th className="p-3">Date de début</th>
                    <th className="p-3">Expiration du tunnel</th>
                    <th className="p-3">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {state.subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500">Aucune souscription enregistrée.</td>
                    </tr>
                  ) : (
                    state.subscriptions.map(sub => {
                      const user = state.users.find(u => u.id === sub.user_id);
                      const plan = state.plans.find(p => p.id === sub.plan_id);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-white">
                            {user ? user.full_name : 'Utilisateur Inconnu'}
                          </td>
                          <td className="p-3 text-blue-400 font-medium">
                            {plan ? plan.name : 'Pass Illimité'}
                          </td>
                          <td className="p-3 text-slate-400">
                            {new Date(sub.start_date).toLocaleString('fr-FR')}
                          </td>
                          <td className="p-3 text-slate-400 font-mono">
                            {new Date(sub.end_date).toLocaleString('fr-FR')}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide ${
                              sub.status === 'active'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                                : 'bg-slate-800 text-slate-500'
                            }`}>
                              {sub.status === 'active' ? 'En cours' : 'Expiré'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENTS */}
        {activeSubTab === 'payments' && (
          <div className="flex flex-col gap-3">
            <div className="relative mb-2">
              <span className="absolute left-3.5 top-2.5 text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Rechercher par Transaction ID, Utilisateur ou Méthode..."
                value={paySearch}
                onChange={e => setPaySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-white"
              />
            </div>

            <div className="bg-slate-950/20 rounded-xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID Transaction</th>
                    <th className="p-3">Abonné</th>
                    <th className="p-3">Montant</th>
                    <th className="p-3">Mode Mobile</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Statut MoMo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500">Aucun paiement trouvé.</td>
                    </tr>
                  ) : (
                    filteredPayments.map(pay => {
                      const user = state.users.find(u => u.id === pay.user_id);
                      return (
                        <tr key={pay.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-slate-300">{pay.transaction_id}</td>
                          <td className="p-3 text-white font-medium">{user ? user.full_name : 'Client Inconnu'}</td>
                          <td className="p-3 font-semibold text-yellow-500">{pay.amount.toLocaleString('fr-FR')} FCFA</td>
                          <td className="p-3 text-slate-400">{pay.payment_method}</td>
                          <td className="p-3 text-slate-400">{new Date(pay.created_at).toLocaleString('fr-FR')}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px] font-bold">
                              Réussi
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS / STATS */}
        {activeSubTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales Volume over Offer Categories */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-400" /> Répartition par Type de Pass (FCFA)
              </h4>

              <div className="flex flex-col gap-3 mt-2">
                {state.plans.map(plan => {
                  const planPayments = state.payments.filter(p => p.plan_id === plan.id && p.status === 'success');
                  const planTotal = planPayments.reduce((acc, curr) => acc + curr.amount, 0);
                  const percentage = totalRevenues > 0 ? (planTotal / totalRevenues) * 100 : 0;

                  return (
                    <div key={plan.id}>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-slate-300 font-semibold">{plan.name}</span>
                        <span className="font-mono text-white">{planTotal.toLocaleString('fr-FR')} FCFA ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Operator distribution volume */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-400" /> Parts d'opérateur mobile (Bénin)
              </h4>

              <div className="flex items-center justify-center h-40 gap-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full border-4 border-yellow-500 bg-slate-950 flex items-center justify-center font-bold text-lg font-mono text-yellow-400">
                    {mtnPaymentsCount + moovPaymentsCount > 0 
                      ? Math.round((mtnPaymentsCount / (mtnPaymentsCount + moovPaymentsCount)) * 100)
                      : 0}%
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">MTN Mobile Money</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500 bg-slate-950 flex items-center justify-center font-bold text-lg font-mono text-emerald-400">
                    {mtnPaymentsCount + moovPaymentsCount > 0 
                      ? Math.round((moovPaymentsCount / (mtnPaymentsCount + moovPaymentsCount)) * 100)
                      : 0}%
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">Moov Money (Bénin)</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center leading-normal mt-2">
                Ces données illustrent les parts de transactions complétées en direct par le portail Kkiapay/FedaPay.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: ADD USER FORM */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-bold text-white font-display">Ajouter un abonné de test</h3>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nom Complet</label>
                <input 
                  type="text" 
                  placeholder="Jean Gnonlonfoun"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Numéro de téléphone</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-500">+229</span>
                  <input 
                    type="tel" 
                    placeholder="97 12 34 56"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 pl-12 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold mt-2"
              >
                Créer l'abonné
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PLAN FORM */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-bold text-white font-display">Créer une offre internet</h3>
              <button 
                onClick={() => setShowAddPlanModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPlan} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nom du forfait</label>
                <input 
                  type="text" 
                  placeholder="Pass 3 Jours Illimité"
                  value={newPlanName}
                  onChange={e => setNewPlanName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Prix (FCFA)</label>
                  <input 
                    type="number" 
                    placeholder="750"
                    value={newPlanPrice}
                    onChange={e => setNewPlanPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Durée Label</label>
                  <input 
                    type="text" 
                    placeholder="3 jours"
                    value={newPlanDuration}
                    onChange={e => setNewPlanDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Durée (Heures de validité)</label>
                <input 
                  type="number" 
                  placeholder="72"
                  value={newPlanHours}
                  onChange={e => setNewPlanHours(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Description</label>
                <textarea 
                  placeholder="Accès haut débit..."
                  value={newPlanDesc}
                  onChange={e => setNewPlanDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold mt-2"
              >
                Créer l'offre
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
