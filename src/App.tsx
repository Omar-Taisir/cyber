
import React, { useState, useEffect } from 'react';
import { View, AuditLogEntry, User, PrismChain, ScanResult, Host } from './types.ts';
import { db } from './firebase.ts';
import { API_BASE_URL } from './config.ts';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import PentestModule from './components/PentestModule.tsx';
import NetworkModule from './components/NetworkModule.tsx';
import Toolbox from './components/Toolbox.tsx';
import EncryptionLab from './components/EncryptionLab.tsx';
import Deobfuscator from './components/Deobfuscator.tsx';
import PayloadGenerator from './components/PayloadGenerator.tsx';
import Settings from './components/Settings.tsx';
import HackBot from './components/HackBot.tsx';
import ReportingModule from './components/ReportingModule.tsx';
import AuthPage from './components/AuthPage.tsx';
import PrismChains from './components/PrismChains.tsx';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chains, setChains] = useState<PrismChain[]>([]);
  const [pentestResults, setPentestResults] = useState<ScanResult[]>([]);
  const [networkHosts, setNetworkHosts] = useState<Host[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const addLog = async (event: string, details: string) => {
    const newLog: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      event,
      details
    };
    
    // We don't need to manually update state here if we use onSnapshot
    // But we keep it for immediate UI feedback (optimistic update)
    // setAuditLogs(prev => [newLog, ...prev].slice(0, 100));

    // Sync to Firebase
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Firebase sync failed: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to sync log to Firebase:", error);
    }
  };

  useEffect(() => {
    console.log("Aegis_Prism: Initializing Subsystems...");
    
    // Real-time listener for Audit Logs
    const logsQuery = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ ...doc.data() } as AuditLogEntry));
      setAuditLogs(logs);
    }, (error) => {
      console.error("Audit Logs Real-time Error:", error);
    });

    // Real-time listener for Tactical Chains
    const chainsQuery = query(collection(db, "tactical_chains"));
    const unsubscribeChains = onSnapshot(chainsQuery, (snapshot) => {
      const remoteChains = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrismChain));
      setChains(remoteChains);
    }, (error) => {
      console.error("Tactical Chains Real-time Error:", error);
    });

    // Real-time listener for Pentest Results
    const pentestQuery = query(collection(db, "pentest_results"), orderBy("timestamp", "desc"), limit(50));
    const unsubscribePentest = onSnapshot(pentestQuery, (snapshot) => {
      const results = snapshot.docs.map(doc => ({ ...doc.data() } as any as ScanResult));
      setPentestResults(results);
    }, (error) => {
      console.error("Pentest Results Real-time Error:", error);
    });

    // Real-time listener for Network Hosts
    const networkQuery = query(collection(db, "network_hosts"));
    const unsubscribeNetwork = onSnapshot(networkQuery, (snapshot) => {
      const hosts = snapshot.docs.map(doc => ({ ...doc.data() } as any as Host));
      setNetworkHosts(hosts);
    }, (error) => {
      console.error("Network Hosts Real-time Error:", error);
    });

    const bootKernel = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog("Kernel_Boot", "Offensive core ready.");
      addLog("API_System", "Tactical Uplink established.");
      setIsReady(true);
    };
    bootKernel();

    return () => {
      unsubscribeLogs();
      unsubscribeChains();
      unsubscribePentest();
      unsubscribeNetwork();
    };
  }, []);

  if (!isReady) return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center space-y-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-cyan-400/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.6em] animate-pulse">Initializing_Aegis_Kernel</p>
        <p className="text-[8px] text-slate-600 font-mono">STANDALONE_STEALTH_MODE_ACTIVE</p>
      </div>
    </div>
  );

  if (!currentUser) {
    return <AuthPage onLogin={setCurrentUser} lang={lang} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard auditLogs={auditLogs} lang={lang} />;
      case View.HACKBOT: return <HackBot lang={lang} />;
      case View.PENTEST: return (
        <PentestModule 
          onAudit={addLog} 
          lang={lang} 
          syncedResults={pentestResults}
          onSyncResult={async (result) => {
            try {
              await fetch(`${API_BASE_URL}/api/pentest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result)
              });
            } catch (error) {
              console.error("Failed to sync pentest result:", error);
            }
          }}
        />
      );
      case View.NETWORK: return (
        <NetworkModule 
          onAudit={addLog} 
          lang={lang} 
          syncedHosts={networkHosts}
          onSyncHosts={async (hosts) => {
            try {
              await fetch(`${API_BASE_URL}/api/network`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hosts })
              });
            } catch (error) {
              console.error("Failed to sync network hosts:", error);
            }
          }}
        />
      );
      case View.TOOLBOX: return <Toolbox lang={lang} />;
      case View.DEOBFUSCATOR: return <Deobfuscator onAudit={addLog} lang={lang} />;
      case View.PAYLOADS: return <PayloadGenerator onAudit={addLog} lang={lang} />;
      case View.CRYPTO: return <EncryptionLab onAudit={addLog} lang={lang} chains={chains} />;
      case View.CRYPTO_CHAINS: return (
        <PrismChains 
          chains={chains} 
          onAddChain={async (c) => {
            // Optimistic update is handled by onSnapshot eventually
            // but we can push to server
            try {
              await fetch(`${API_BASE_URL}/api/chains`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(c)
              });
              addLog("Chain_Created", `New cryptographic chain ${c.id} initialized.`);
            } catch (error) {
              console.error("Failed to save chain:", error);
            }
          }} 
          onDeleteChain={async (id) => {
            try {
              await fetch(`${API_BASE_URL}/api/chains/${id}`, { method: 'DELETE' });
              addLog("Chain_Purged", `Cryptographic chain ${id} removed from buffer.`);
            } catch (error) {
              console.error("Failed to delete chain:", error);
            }
          }}
          lang={lang} 
        />
      );
      case View.REPORTS: return <ReportingModule auditLogs={auditLogs} lang={lang} />;
      case View.SETTINGS: return <Settings onAudit={addLog} lang={lang} setLang={setLang} user={currentUser} />;
      default: return <Dashboard auditLogs={auditLogs} lang={lang} />;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen w-screen bg-[#000808] text-white overflow-hidden ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        lang={lang}
        user={currentUser}
        onLogout={() => setCurrentUser(null)}
      />
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        {isSyncing && (
          <div className="absolute top-4 right-4 z-[110] flex items-center gap-2 px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Firebase_Syncing...</span>
          </div>
        )}
        <div className="p-4 sm:p-6 md:p-10 lg:p-12 xl:p-16 max-w-[1600px] mx-auto min-h-full">
          {renderContent()}
        </div>
      </main>

      <button 
        onClick={() => setCurrentView(View.HACKBOT)}
        className="md:hidden fixed bottom-28 right-6 w-16 h-16 bg-cyan-400 text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.5)] z-[95] active:scale-90 transition-transform"
      >
        <i className="fas fa-brain text-2xl"></i>
      </button>
    </div>
  );
};

export default App;
