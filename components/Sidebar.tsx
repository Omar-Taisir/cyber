
import React from 'react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  lang: 'en' | 'ar';
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, lang, user, onLogout }) => {
  const translations = {
    en: {
      DASHBOARD: 'CONTROL',
      HACKBOT: 'NEURAL',
      PENTEST: 'AUDIT',
      NETWORK: 'NODES',
      TOOLBOX: 'ASSETS',
      CRYPTO: 'CIPHER',
      CRYPTO_CHAINS: 'CHAINS',
      DEOBFUSCATOR: 'REVERSE',
      REPORTS: 'INTEL',
      SETTINGS: 'SYSTEM',
      LOGOUT: 'TERMINATE'
    },
    ar: {
      DASHBOARD: 'التحكم',
      HACKBOT: 'عصبي',
      PENTEST: 'تدقيق',
      NETWORK: 'العقد',
      TOOLBOX: 'أصول',
      CRYPTO: 'تشفير',
      CRYPTO_CHAINS: 'سلاسل',
      DEOBFUSCATOR: 'عكس',
      REPORTS: 'استخبارات',
      SETTINGS: 'النظام',
      LOGOUT: 'إنهاء الجلسة'
    }
  };

  const t = translations[lang];

  const menuItems = [
    { view: View.DASHBOARD, icon: 'fa-gauge-high', label: t.DASHBOARD },
    { view: View.HACKBOT, icon: 'fa-brain', label: t.HACKBOT },
    { view: View.PENTEST, icon: 'fa-shield-halved', label: t.PENTEST },
    { view: View.NETWORK, icon: 'fa-network-wired', label: t.NETWORK },
    { view: View.TOOLBOX, icon: 'fa-toolbox', label: t.TOOLBOX },
    { view: View.DEOBFUSCATOR, icon: 'fa-dna', label: t.DEOBFUSCATOR },
    { view: View.CRYPTO, icon: 'fa-key', label: t.CRYPTO },
    { view: View.CRYPTO_CHAINS, icon: 'fa-link', label: t.CRYPTO_CHAINS },
    { view: View.REPORTS, icon: 'fa-file-invoice-dollar', label: t.REPORTS },
    { view: View.SETTINGS, icon: 'fa-sliders', label: t.SETTINGS },
  ];

  return (
    <>
      <aside className={`hidden md:flex w-24 lg:w-72 bg-[#001212]/95 backdrop-blur-3xl border-${lang === 'ar' ? 'l' : 'r'} border-white/5 flex-col h-screen sticky top-0 z-[100] transition-all`}>
        <div className="p-10 flex justify-center lg:justify-start items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.4)] rotate-3">
            <i className="fas fa-shield-cat text-2xl"></i>
          </div>
          <div className="hidden lg:block">
            <span className="text-xl font-black text-white tracking-tighter block leading-none">AEGIS</span>
            <span className="text-[10px] font-black text-cyan-400 tracking-[0.3em] uppercase opacity-60">PRISM_V7</span>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-3 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all border ${
                currentView === item.view
                  ? 'bg-cyan-400 text-black border-cyan-400 shadow-xl shadow-cyan-400/20'
                  : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-6 flex justify-center shrink-0">
                 <i className={`fas ${item.icon} text-lg`}></i>
              </div>
              <span className={`hidden lg:block font-black text-[11px] uppercase tracking-[0.2em] whitespace-nowrap`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
           <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shrink-0">
                 <i className="fas fa-user-secret"></i>
              </div>
              <div className="hidden lg:block min-w-0 flex-1">
                 <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{user.username}</p>
                 <p className="text-[8px] font-black text-cyan-400/60 uppercase tracking-widest">{user.clearance}_CLEARANCE</p>
              </div>
              <button 
                onClick={onLogout}
                className="hidden lg:flex w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shrink-0"
              >
                <i className="fas fa-power-off text-xs"></i>
              </button>
           </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#001212]/95 backdrop-blur-2xl border-t border-white/10 z-[100] px-4 h-20 flex justify-around items-center pb-safe">
        {menuItems.slice(0, 5).map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all ${
              currentView === item.view ? 'bg-cyan-400 text-black shadow-xl shadow-cyan-400/40' : 'text-slate-500'
            }`}
          >
            <i className={`fas ${item.icon} text-base`}></i>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
