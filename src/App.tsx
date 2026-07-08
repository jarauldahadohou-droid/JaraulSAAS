import React, { useState, useEffect } from 'react';
import PhoneSimulator from './components/PhoneSimulator';
import AdminDashboard from './components/AdminDashboard';
import DatabaseViewer from './components/DatabaseViewer';
import TechDocs from './components/TechDocs';
import { getInitialState, saveState } from './data/mockData';
import { AppState, User } from './types';
import { seedFirestoreIfEmpty, listenToFirebaseState, syncStateDiffToFirestore } from './lib/firebaseSync';
import { 
  Network, 
  Terminal, 
  BookOpen, 
  Database, 
  Settings, 
  LayoutDashboard, 
  Phone, 
  Info, 
  CheckCircle, 
  ShieldAlert,
  Smartphone
} from 'lucide-react';

export default function App() {
  // Global application state
  const [state, setState] = useState<AppState>(getInitialState());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Tab selected in developer workspace
  // 'admin' | 'database' | 'docs'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'admin' | 'database' | 'docs'>('admin');

  // Load first user as default logged-in user on initialization to skip login if desired
  useEffect(() => {
    if (state.users.length > 0) {
      setCurrentUser(state.users[0]);
    }
  }, []);

  // 1. Initialize Firestore collections and seed if empty, and listen in real-time
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function initFirebaseSync() {
      // Seed if collections are empty
      await seedFirestoreIfEmpty();
      
      // Start listening to real-time updates
      unsubscribe = listenToFirebaseState((firebaseState) => {
        setState(firebaseState);
      });
    }

    initFirebaseSync();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Update global state and persist to localStorage + Firebase Cloud Firestore
  const handleUpdateState = async (newState: AppState) => {
    // 1. Optimistic UI update
    setState(newState);
    
    // 2. Persist to local storage
    saveState(newState);

    // 3. Diff and push updates to Firebase Firestore
    await syncStateDiffToFirestore(state, newState);
  };

  // Keep current logged-in user in sync if changed from Admin Panel
  useEffect(() => {
    if (currentUser) {
      const updatedUser = state.users.find(u => u.id === currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      } else {
        // If user was deleted
        setCurrentUser(state.users[0] || null);
      }
    }
  }, [state.users]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      
      {/* Upper Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md border border-blue-400">
            <Network className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display tracking-tight text-white">IlimiNetZone</h1>
              <span className="text-[10px] font-bold bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded-full border border-blue-700/50">V1.0.0</span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 font-sans">
              Internet illimité, simple et rapide au Bénin (MTN & Moov Mobile Money)
            </p>
          </div>
        </div>

        {/* Action tags and quick indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Firebase:</span>
            <span className="text-emerald-400 font-bold">Actif (en temps réel)</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">MoMo VPN:</span>
            <span className="text-emerald-400 font-bold">Actif</span>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 font-mono">
            BJ (XOF / FCFA)
          </span>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE SMARTPHONE APP SIMULATOR (4 Columns wide on large screens) */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col items-center justify-center lg:sticky lg:top-24">
          <div className="w-full max-w-[380px] text-center mb-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Simulateur Mobile Interactif
            </span>
            <p className="text-[10px] text-slate-500">
              Cliquez pour naviguer, acheter un forfait MTN/Moov et activer la connexion Internet.
            </p>
          </div>

          <PhoneSimulator 
            state={state} 
            updateState={handleUpdateState}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        </section>

        {/* RIGHT COLUMN: DEVELOPER WORKSPACE PANEL (8 Columns wide on large screens) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 h-full">
          
          {/* Workspace navigation tabs */}
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex gap-2">
            <button
              onClick={() => setActiveWorkspaceTab('admin')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeWorkspaceTab === 'admin' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Web Admin Dashboard</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('database')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeWorkspaceTab === 'database' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Firebase Database State</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('docs')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeWorkspaceTab === 'docs' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Guides d'Intégration</span>
            </button>
          </div>

          {/* Render Active Developer Tab */}
          <div className="flex-1">
            {activeWorkspaceTab === 'admin' && (
              <AdminDashboard state={state} updateState={handleUpdateState} />
            )}
            {activeWorkspaceTab === 'database' && (
              <DatabaseViewer state={state} />
            )}
            {activeWorkspaceTab === 'docs' && (
              <TechDocs />
            )}
          </div>

          {/* Quick Integration Note card */}
          <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-blue-200">Prêt pour le déploiement de production</h4>
              <p className="text-[11px] text-slate-400 leading-normal mt-1">
                Cette architecture FlutterFlow modélise fidèlement les exigences télécoms de l'application IlimiNetZone pour le Bénin. Les tables de données préparent l'intégration à Supabase et à des passerelles d'API réelles comme FedaPay ou Kkiapay (qui prennent en charge MTN MoMo et Moov Money). La simulation VPN propose la structure requise pour encapsuler les paquets IP via le protocole VpnService sous Android ou iOS.
              </p>
            </div>
          </div>

        </section>

      </main>

      {/* Footer information bar */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 mt-auto text-center">
        <p className="text-[11px] text-slate-500 font-mono">
          IlimiNetZone V1 • Conçu avec élégance et précision professionnelle pour l'Afrique de l'Ouest.
        </p>
      </footer>

    </div>
  );
}
