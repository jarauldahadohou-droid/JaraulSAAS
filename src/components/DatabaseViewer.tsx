import React, { useState } from 'react';
import { Database, Search, Download, Terminal, Table, RefreshCw, Key, ShieldAlert } from 'lucide-react';
import { AppState } from '../types';

interface DatabaseViewerProps {
  state: AppState;
}

export default function DatabaseViewer({ state }: DatabaseViewerProps) {
  const [selectedTable, setSelectedTable] = useState<'users' | 'plans' | 'subscriptions' | 'payments'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ilimi_netzone_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-200 flex flex-col h-full font-sans">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-950 flex items-center justify-center border border-indigo-900 text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">Firebase Firestore Inspector</h3>
            <p className="text-[10px] text-slate-400">Visualisation dynamique des collections documentaires en temps réel</p>
          </div>
        </div>

        <button 
          onClick={handleExportJSON}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Exporter JSON
        </button>
      </div>

      {/* Table select buttons */}
      <div className="grid grid-cols-4 gap-1.5 mb-4 bg-slate-950 p-1 rounded-lg">
        <button
          onClick={() => { setSelectedTable('users'); setSearchQuery(''); }}
          className={`py-1.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1 ${
            selectedTable === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-3 h-3" /> USERS
        </button>
        <button
          onClick={() => { setSelectedTable('plans'); setSearchQuery(''); }}
          className={`py-1.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1 ${
            selectedTable === 'plans' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-3 h-3" /> PLANS
        </button>
        <button
          onClick={() => { setSelectedTable('subscriptions'); setSearchQuery(''); }}
          className={`py-1.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1 ${
            selectedTable === 'subscriptions' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-3 h-3" /> SUBS
        </button>
        <button
          onClick={() => { setSelectedTable('payments'); setSearchQuery(''); }}
          className={`py-1.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1 ${
            selectedTable === 'payments' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-3 h-3" /> PAYMENTS
        </button>
      </div>

      {/* Database Search */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-2 text-slate-500">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          placeholder={`Filtre ou requête rapide dans la table public.${selectedTable}...`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-8.5 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] focus:outline-none focus:border-indigo-500 text-white font-mono placeholder:text-slate-600"
        />
      </div>

      {/* Table grid render */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-950 max-h-[300px]">
        {selectedTable === 'users' && (
          <table className="w-full text-left font-mono text-[10px] text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 uppercase">
              <tr>
                <th className="p-2.5">id (uuid)</th>
                <th className="p-2.5">full_name (text)</th>
                <th className="p-2.5">phone_number (text)</th>
                <th className="p-2.5">created_at (timestamptz)</th>
                <th className="p-2.5">status (text)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {state.users
                .filter(u => u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone_number.includes(searchQuery))
                .map(user => (
                  <tr key={user.id} className="hover:bg-slate-900/60">
                    <td className="p-2.5 text-indigo-400 font-bold truncate max-w-[90px]" title={user.id}>{user.id}</td>
                    <td className="p-2.5 text-slate-100 font-semibold">{user.full_name}</td>
                    <td className="p-2.5 text-emerald-400">{user.phone_number}</td>
                    <td className="p-2.5 text-slate-500">{new Date(user.created_at).toISOString()}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${user.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {selectedTable === 'plans' && (
          <table className="w-full text-left font-mono text-[10px] text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 uppercase">
              <tr>
                <th className="p-2.5">id (uuid)</th>
                <th className="p-2.5">name (text)</th>
                <th className="p-2.5">price (int4)</th>
                <th className="p-2.5">duration (text)</th>
                <th className="p-2.5">active (bool)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {state.plans
                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-900/60">
                    <td className="p-2.5 text-indigo-400 font-bold truncate max-w-[90px]" title={plan.id}>{plan.id}</td>
                    <td className="p-2.5 text-slate-100 font-semibold">{plan.name}</td>
                    <td className="p-2.5 text-yellow-500 font-bold">{plan.price} XOF</td>
                    <td className="p-2.5 text-slate-400">{plan.duration}</td>
                    <td className="p-2.5 text-slate-100">{plan.active ? 'true' : 'false'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {selectedTable === 'subscriptions' && (
          <table className="w-full text-left font-mono text-[10px] text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 uppercase">
              <tr>
                <th className="p-2.5">id (uuid)</th>
                <th className="p-2.5">user_id (uuid)</th>
                <th className="p-2.5">plan_id (uuid)</th>
                <th className="p-2.5">start_date</th>
                <th className="p-2.5">end_date</th>
                <th className="p-2.5">status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {state.subscriptions
                .filter(sub => sub.user_id.includes(searchQuery) || sub.plan_id.includes(searchQuery))
                .map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-900/60">
                    <td className="p-2.5 text-indigo-400 font-bold truncate max-w-[90px]" title={sub.id}>{sub.id}</td>
                    <td className="p-2.5 text-slate-400 truncate max-w-[90px]" title={sub.user_id}>{sub.user_id}</td>
                    <td className="p-2.5 text-slate-400 truncate max-w-[90px]" title={sub.plan_id}>{sub.plan_id}</td>
                    <td className="p-2.5 text-slate-500">{new Date(sub.start_date).toISOString()}</td>
                    <td className="p-2.5 text-slate-500">{new Date(sub.end_date).toISOString()}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${sub.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {selectedTable === 'payments' && (
          <table className="w-full text-left font-mono text-[10px] text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 uppercase">
              <tr>
                <th className="p-2.5">id (uuid)</th>
                <th className="p-2.5">user_id (uuid)</th>
                <th className="p-2.5">amount (int4)</th>
                <th className="p-2.5">payment_method</th>
                <th className="p-2.5">transaction_id</th>
                <th className="p-2.5">status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {state.payments
                .filter(p => p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) || p.payment_method.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-900/60">
                    <td className="p-2.5 text-indigo-400 font-bold truncate max-w-[90px]" title={pay.id}>{pay.id}</td>
                    <td className="p-2.5 text-slate-400 truncate max-w-[90px]" title={pay.user_id}>{pay.user_id}</td>
                    <td className="p-2.5 text-yellow-500 font-bold">{pay.amount}</td>
                    <td className="p-2.5 text-slate-300">{pay.payment_method}</td>
                    <td className="p-2.5 text-slate-100 font-bold">{pay.transaction_id}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-950 text-emerald-400">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-3.5 bg-slate-950 border border-slate-850 rounded-xl p-3 flex items-start gap-2.5">
        <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 font-mono leading-normal">
          <strong className="text-emerald-400 font-bold">INFO :</strong> Firebase Firestore synchronise les données en temps réel via des connexions WebSocket sécurisées. Toute transaction ou nouvel abonné enregistré dans le simulateur mobile à gauche s'enregistre immédiatement dans Firestore sur le projet Google Cloud.
        </p>
      </div>

    </div>
  );
}
