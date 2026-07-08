import React, { useState } from 'react';
import { supabaseSQL, mobileMoneyIntegrationCode, vpnApiIntegrationCode } from '../data/dbSchema';
import { 
  Copy, 
  Check, 
  Terminal, 
  FileCode2, 
  Shield, 
  Network,
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square, 
  AlertTriangle,
  Lock,
  Activity,
  FileCheck,
  RotateCw,
  KeyRound,
  EyeOff,
  TrendingUp,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

// Structured best practices based on the MTN MoMo official security guidelines
interface CompliancePoint {
  id: number;
  title: string;
  category: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  bgColor: string;
  summary: string;
  details: string[];
}

const compliancePoints: CompliancePoint[] = [
  {
    id: 1,
    title: "Sécurité & Gestion des Identifiants",
    category: "Identifiants",
    icon: KeyRound,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    summary: "Protection de l'API User, API Key et Subscription Keys contre toute fuite.",
    details: [
      "Ne stockez jamais d'identifiants sensibles en dur dans votre code source.",
      "Utilisez des variables d'environnement (.env) cryptées côté serveur, et assurez-vous qu'elles soient exclues de Git (.gitignore).",
      "Séparez les environnements en utilisant des clés distinctes pour la Sandbox, le Staging et la Production.",
      "Déclenchez une rotation immédiate en cas de soupçon de compromission ou de départ de collaborateurs clés.",
      "Ne réutilisez pas les tokens d'accès entre différents services et mettez-les en cache uniquement pendant leur durée de validité."
    ]
  },
  {
    id: 2,
    title: "Callbacks & Sécurité des Webhooks",
    category: "Réseau & Webhooks",
    icon: Network,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    summary: "Sécurisation des endpoints de réception pour parer aux injections et falsifications.",
    details: [
      "Utilisez obligatoirement HTTPS sur le port standard 443 avec un certificat SSL délivré par une autorité de certification (CA) approuvée.",
      "Ne faites jamais confiance aveuglément au payload entrant sans valider l'adresse IP source (callbacks provenant des plages officielles MTN MoMo).",
      "Répondez sous un délai de quelques secondes par un HTTP 200 OK pour acquitter la réception, puis traitez la logique de manière asynchrone (via une file d'attente interne).",
      "Sécurité avancée : Intégrez un hash cryptographique spécifique à la transaction dans le paramètre de route de l'URL du webhook (ex: /disbursement-callbacks/{transactionHash}). Les paramètres de requête ne sont pas autorisés."
    ]
  },
  {
    id: 3,
    title: "Suivi du Statut des Transactions",
    category: "Transactions",
    icon: Activity,
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    summary: "Mécanismes de secours indépendants du callback pour vérifier les transactions en attente.",
    details: [
      "Ne vous reposez pas uniquement sur la réception des callbacks webhooks (qui peuvent échouer en cas d'incident réseau).",
      "Implémentez un mécanisme d'interrogation (Polling) via l'endpoint officiel Get Transaction Status en cas de retard.",
      "Appliquez une stratégie de backoff exponentiel pour le polling avec un délai maximal de temporisation (Timeout).",
      "Arrêtez impérativement le polling dès que la transaction atteint un état terminal (SUCCESS ou FAILED).",
      "Gérez l'expérience utilisateur (UX) pour informer des validations retardées, sans supposer un succès instantané."
    ]
  },
  {
    id: 4,
    title: "Liste Blanche des Adresses IP",
    category: "Réseau & Webhooks",
    icon: Shield,
    iconColor: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    summary: "Restriction d'accès stricte pour les services financiers critiques.",
    details: [
      "Assurez-vous que vos serveurs disposent d'adresses IP publiques fixes et stables pour les intégrations MoMo.",
      "Communiquez et enregistrez à l'avance auprès de MTN toute modification d'adresse IP de production.",
      "Configurez la liste blanche IP pour tous les services sensibles : Disbursements (Décaissements), Remittances (Transferts), Collections (Prélèvements) et Dynamic Journey Services."
    ]
  },
  {
    id: 5,
    title: "Consentement Client pour les Débits",
    category: "Sécurité & UX",
    icon: Lock,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    summary: "Validation explicite et vérification de la propriété du numéro de téléphone.",
    details: [
      "Le consentement de l'utilisateur final est juridiquement et techniquement obligatoire avant tout prélèvement d'argent.",
      "Vérifiez que le numéro de téléphone mobile (MSISDN) saisi appartient bel et bien à l'utilisateur actif.",
      "Implémentez une logique de validation OTP (One-Time Password) par SMS lors de l'enregistrement ou de la saisie d'un nouveau numéro non vérifié."
    ]
  },
  {
    id: 6,
    title: "Idempotence & Sécurité des Requêtes",
    category: "Transactions",
    icon: RotateCw,
    iconColor: "text-teal-400",
    bgColor: "bg-teal-500/10",
    summary: "Prévention des double-débits accidentels en cas de retry.",
    details: [
      "Générez systématiquement l'entête standard MoMo X-Reference-Id côté serveur en utilisant des UUID v4 uniques.",
      "Enregistrez l'état 'Pending' et les métadonnées de la transaction en base de données AVANT d'envoyer la requête à l'API MTN.",
      "Ne réutilisez sous aucun prétexte un X-Reference-Id pour deux transactions distinctes.",
      "Garantissez que votre logique de retry automatique (en cas de timeout) est strictement idempotente pour ne jamais débiter le client deux fois."
    ]
  },
  {
    id: 7,
    title: "Gestion des Erreurs & Codes HTTP",
    category: "Identifiants",
    icon: AlertTriangle,
    iconColor: "text-rose-400",
    bgColor: "bg-rose-500/10",
    summary: "Interprétation standardisée des retours de l'API MoMo.",
    details: [
      "Attention : Le code HTTP 202 Accepted indique que la requête est reçue, mais ne garantit PAS le succès de la transaction.",
      "Centralisez votre logique d'analyse de code d'erreur pour traduire les statuts MTN en messages clairs et constructifs pour l'utilisateur.",
      "Enregistrez et conservez précieusement les ID de corrélation (Correlation-IDs) renvoyés par l'API pour faciliter les diagnostics de support."
    ]
  },
  {
    id: 8,
    title: "Journalisation, Audit & Logs",
    category: "Sécurité",
    icon: EyeOff,
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    summary: "Garantie de traçabilité tout en protégeant les données personnelles.",
    details: [
      "Masquez systématiquement les champs ultra-sensibles (tokens de session, codes secrets, MSISDN complets si requis réglementairement) dans vos fichiers de logs.",
      "Enregistrez avec précision les horodatages UTC, les ID de transaction système, les X-Reference-Id et chaque changement d'état.",
      "Sécurisez le serveur de logs contre toute modification fortuite ou malveillante (fichiers logs en lecture seule ou exportés sur un serveur d'audit isolé)."
    ]
  },
  {
    id: 9,
    title: "Rapprochement Financier Quotidien",
    category: "Transactions",
    icon: FileCheck,
    iconColor: "text-sky-400",
    bgColor: "bg-sky-500/10",
    summary: "Suivi comptable quotidien pour détecter tout écart de solde immédiatement.",
    details: [
      "Automatisez un rapprochement financier quotidien entre vos écritures comptables locales et les rapports d'activité exportés de l'API MoMo.",
      "N'attendez jamais la clôture mensuelle ou un audit trimestriel pour examiner le solde de vos comptes.",
      "Définitsez des procédures claires pour traiter et résoudre immédiatement toute anomalie de transaction ou écart de montant constaté."
    ]
  },
  {
    id: 10,
    title: "Support Technique & Processus d'Escalade",
    category: "Sécurité & UX",
    icon: FileCode2,
    iconColor: "text-slate-400",
    bgColor: "bg-slate-500/10",
    summary: "Données clés à fournir au support MTN MoMo lors d'incidents.",
    details: [
      "Formatez vos requêtes de support de manière standardisée pour obtenir une résolution ultra-rapide.",
      "Assurez-vous de toujours consigner et fournir les 4 éléments obligatoires au support :",
      "1. Le MSISDN (Numéro de téléphone du client)",
      "2. Le X-Reference-Id (UUID généré pour la transaction)",
      "3. L'horodatage exact UTC de la requête",
      "4. Le type exact de l'opération (Debit/Collection, Transfer, Disbursement)."
    ]
  }
];

export default function TechDocs() {
  const [activeTab, setActiveTab] = useState<'supabase' | 'fedapay' | 'security' | 'vpn'>('supabase');
  const [copied, setCopied] = useState(false);
  const [expandedChecklist, setExpandedChecklist] = useState<Record<number, boolean>>({});
  const [complianceChecked, setComplianceChecked] = useState<Record<number, boolean>>(() => {
    // Attempt to load previous compliance progress from localStorage if available
    try {
      const saved = localStorage.getItem('momo_compliance_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleCompliance = (id: number) => {
    const updated = { ...complianceChecked, [id]: !complianceChecked[id] };
    setComplianceChecked(updated);
    try {
      localStorage.setItem('momo_compliance_checklist', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Compile compliance stats
  const completedCount = Object.values(complianceChecked).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / compliancePoints.length) * 100);

  const getMarkdownGuide = () => {
    return `# Guide de Sécurité & Bonnes Pratiques API MTN MoMo (Bénin)

Ce guide récapitule les 10 piliers essentiels pour sécuriser votre intégration d'API Mobile Money.

${compliancePoints.map(p => `## ${p.id}. ${p.title} (${p.category})
${p.summary}

### Bonnes pratiques & Exigences :
${p.details.map(d => `- ${d}`).join('\n')}
`).join('\n')}

---
Fait à Cotonou, Bénin — Équipe Technique IlimiNetZone.`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeText = () => {
    if (activeTab === 'supabase') return supabaseSQL;
    if (activeTab === 'fedapay') return mobileMoneyIntegrationCode;
    if (activeTab === 'security') return getMarkdownGuide();
    return vpnApiIntegrationCode;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-200 flex flex-col h-full font-sans transition-all">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-blue-400" /> Guide de Développement & Sécurité V1
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">
            {activeTab === 'security' 
              ? "Exigences de sécurité et bonnes pratiques officielles de l'API MTN MoMo"
              : "Codes sources et scripts d'intégration prêts à l'emploi (Supabase, FedaPay, Service VPN)"}
          </p>
        </div>

        <button
          onClick={() => handleCopy(getCodeText())}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-md self-end sm:self-start active:scale-95 shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copié !' : activeTab === 'security' ? 'Copier le Guide Markdown' : 'Copier le code'}
        </button>
      </div>

      {/* Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-4 bg-slate-950 p-1 rounded-xl shrink-0">
        <button
          onClick={() => setActiveTab('supabase')}
          className={`py-2 rounded-lg text-[9px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
            activeTab === 'supabase' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" /> Supabase SQL
        </button>
        <button
          onClick={() => setActiveTab('fedapay')}
          className={`py-2 rounded-lg text-[9px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
            activeTab === 'fedapay' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" /> FedaPay MoMo
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-2 rounded-lg text-[9px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 relative ${
            activeTab === 'security' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sécurité MoMo
          {progressPercent > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] font-bold px-1 rounded-full border border-slate-950">
              {progressPercent}%
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('vpn')}
          className={`py-2 rounded-lg text-[9px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
            activeTab === 'vpn' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Service VPN
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'security' ? (
        // INTERACTIVE COMPLIANCE DASHBOARD
        <div className="flex-1 flex flex-col min-h-[300px]">
          
          {/* Progress Banner */}
          <div className="bg-slate-950 rounded-xl p-3 mb-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Index de Conformité API MoMo</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-white font-display">{completedCount} / 10</span>
                <span className="text-xs text-slate-400 font-medium">exigences validées</span>
              </div>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="flex-1 max-w-[240px]">
              <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 mb-1">
                <span>{progressPercent}% de conformité</span>
                {progressPercent === 100 && <span className="text-emerald-400 font-bold flex items-center gap-0.5">Prêt Production <CheckCircle2 className="w-3 h-3 inline" /></span>}
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    progressPercent < 40 ? 'bg-rose-500' :
                    progressPercent < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Interactive Accordion List */}
          <div className="flex-1 overflow-y-auto max-h-[320px] flex flex-col gap-2.5 pr-1">
            {compliancePoints.map(point => {
              const Icon = point.icon;
              const isExpanded = !!expandedChecklist[point.id];
              const isChecked = !!complianceChecked[point.id];

              return (
                <div 
                  key={point.id} 
                  className={`border rounded-xl transition-all ${
                    isExpanded 
                      ? 'bg-slate-950/60 border-slate-700/80 shadow-md ring-1 ring-blue-500/10' 
                      : 'bg-slate-950/25 border-slate-800 hover:border-slate-700 hover:bg-slate-950/40'
                  }`}
                >
                  {/* Point Header */}
                  <div 
                    onClick={() => toggleExpanded(point.id)}
                    className="p-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompliance(point.id);
                        }}
                        className={`p-1 rounded transition-colors shrink-0 ${
                          isChecked ? 'text-emerald-400 hover:text-emerald-500' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={isChecked ? "Marquer non conforme" : "Valider la recommandation"}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4.5 h-4.5" />
                        ) : (
                          <Square className="w-4.5 h-4.5" />
                        )}
                      </button>

                      {/* Icon & Details */}
                      <div className={`w-7 h-7 rounded-lg ${point.bgColor} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${point.iconColor}`} />
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-white truncate">{point.id}. {point.title}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                            {point.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{point.summary}</p>
                      </div>
                    </div>

                    {/* Chevron icon */}
                    <div className="text-slate-500 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Point Details (Expanded) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-slate-950/80 rounded-b-xl animate-in fade-in duration-200">
                      <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">Instructions techniques & directives :</h4>
                      <ul className="flex flex-col gap-2">
                        {point.details.map((detail, index) => (
                          <li key={index} className="text-[10px] text-slate-400 leading-normal flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Self-Check Quick Button */}
                      <div className="mt-3.5 pt-3 border-t border-slate-800/40 flex justify-end">
                        <button
                          onClick={() => toggleCompliance(point.id)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1.5 shadow-inner ${
                            isChecked 
                              ? 'bg-rose-950/30 hover:bg-rose-950/55 border border-rose-900/30 text-rose-300' 
                              : 'bg-emerald-950/30 hover:bg-emerald-950/55 border border-emerald-900/30 text-emerald-300'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {isChecked ? "Démarquer comme Conforme" : "Confirmer notre Conformité"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // ORIGINAL CODE VIEWPORTS
        <div className="flex-1 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 overflow-auto font-mono text-[10px] text-slate-300 relative max-h-[350px]">
          <pre className="whitespace-pre">{getCodeText()}</pre>
        </div>
      )}

      {/* Footer Info Tips */}
      <div className="mt-4 text-[9px] text-slate-500 leading-normal border-t border-slate-800 pt-3 flex justify-between items-center shrink-0">
        <span>
          {activeTab === 'supabase' && "💡 Exécutez ce script SQL dans l'éditeur SQL de votre projet Supabase pour créer la base complète et activer la sécurité RLS."}
          {activeTab === 'fedapay' && "💡 Intégrez FedaPay ou Kkiapay dans votre backend pour autoriser les paiements par MTN MoMo et Moov Money au Bénin."}
          {activeTab === 'security' && "💡 Cochez les exigences à mesure que vous les implémentez dans vos fonctions cloud ou backend FlutterFlow."}
          {activeTab === 'vpn' && "💡 Ce wrapper utilise les API natives d'Android/iOS pour encapsuler la connexion internet dans un tunnel chiffré."}
        </span>
        {activeTab === 'security' && (
          <span className="text-emerald-500/80 font-mono font-bold shrink-0 hidden sm:inline">
            Fichier: momo_best_practices.md
          </span>
        )}
      </div>

    </div>
  );
}
