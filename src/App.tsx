
import React, { useState, useEffect } from 'react';
import { View, AuditLogEntry, User, PrismChain } from './types.ts';
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
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { TacticalDB } from './services/dbService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chains, setChains] = useState<PrismChain[]>([]);

  const addLog = (event: string, details: string) => {
    const newLog: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      event,
      details
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  useEffect(() => {
    const bootKernel = async () => {
      console.log("Aegis_Prism: Initializing Subsystems...");

      await new Promise(resolve => setTimeout(resolve, 800));
      addLog("Kernel_Boot", "Offensive core ready.");
      addLog("API_System", "Public Tactical API (v1.0) exposed globally.");
      setIsReady(true);
    };
    bootKernel();

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore if needed
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;

        setCurrentUser({
          id: firebaseUser.uid,
          username: userData?.username || firebaseUser.displayName || 'OPERATOR',
          email: firebaseUser.email || '',
          clearance: userData?.clearance || 'DELTA',
          avatar: firebaseUser.photoURL || undefined
        });

        // Sync tactical experiences from cloud
        TacticalDB.syncFromCloud();

        addLog("Auth_Sync", `Identity verified for ${firebaseUser.email}`);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
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
      case View.PENTEST: return <PentestModule onAudit={addLog} lang={lang} />;
      case View.NETWORK: return <NetworkModule onAudit={addLog} lang={lang} />;
      case View.TOOLBOX: return <Toolbox lang={lang} />;
      case View.DEOBFUSCATOR: return <Deobfuscator onAudit={addLog} lang={lang} />;
      case View.PAYLOADS: return <PayloadGenerator onAudit={addLog} lang={lang} />;
      case View.CRYPTO: return <EncryptionLab onAudit={addLog} lang={lang} chains={chains} />;
      case View.CRYPTO_CHAINS: return (
        <PrismChains
          chains={chains}
          onAddChain={(c) => {
            setChains([...chains, c]);
            addLog("Chain_Created", `New cryptographic chain ${c.id} initialized.`);
          }}
          onDeleteChain={(id) => {
            setChains(chains.filter(c => c.id !== id));
            addLog("Chain_Purged", `Cryptographic chain ${id} removed from buffer.`);
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
        onLogout={async () => {
          await auth.signOut();
          setCurrentUser(null);
        }}
      />
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
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
