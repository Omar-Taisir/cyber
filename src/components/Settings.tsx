
import React, { useState } from 'react';
import { User } from '../types';

interface SettingsProps {
  onAudit: (event: string, details: string) => void;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ onAudit, lang, setLang, user }) => {
  const [telemetry, setTelemetry] = useState(true);
  const [hasKey, setHasKey] = useState(false);
  const [manualKey, setManualKey] = useState(() => localStorage.getItem('CUSTOM_GEMINI_API_KEY') || '');

  const handleManualKeyChange = (val: string) => {
    setManualKey(val);
    localStorage.setItem('CUSTOM_GEMINI_API_KEY', val);
    if (val) {
      onAudit("Manual API Key Updated", "Operator provided custom Gemini API key.");
    }
  };

  React.useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const active = await window.aistudio.hasSelectedApiKey();
        setHasKey(active);
      }
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true);
      onAudit("Tactical Uplink Established", "User-provided API key integrated into offensive core.");
    }
  };

  const translations = {
    en: {
      TITLE: 'Node_Settings',
      INTERFACE: 'Core_Interface',
      VARS: 'Operational Variables',
      ARTIFACTS: 'TACTICAL_SCANLINES',
      ARTIFACTS_DESC: 'Toggle interference layers.',
      KERNEL: 'Infil_Kernel',
      LANG: 'SYSTEM_LANGUAGE',
      IDENTITY: 'Identity_Profile',
      CLEARANCE: 'CLEARANCE_LEVEL',
      UPLINK: 'Tactical_Uplink',
      UPLINK_DESC: 'Secure API Key Management',
      CONNECT_KEY: 'ESTABLISH_UPLINK',
      KEY_ACTIVE: 'UPLINK_ACTIVE',
      KEY_INACTIVE: 'UPLINK_OFFLINE',
      BILLING_INFO: 'Requires Paid Google Cloud Project',
      MANUAL_KEY_LABEL: 'Gemini API Key',
      MANUAL_KEY_PLACEHOLDER: 'Enter your Gemini API Key'
    },
    ar: {
      TITLE: 'إعدادات_العقدة',
      INTERFACE: 'واجهة_النواة',
      VARS: 'المتغيرات التشغيلية',
      ARTIFACTS: 'خطوط_المسح_التكتيكية',
      ARTIFACTS_DESC: 'تبديل طبقات التداخل.',
      KERNEL: 'نواة_التسلل',
      LANG: 'لغة_النظام',
      IDENTITY: 'ملف_الهوية',
      CLEARANCE: 'مستوى_التصريح',
      UPLINK: 'الارتباط_التكتيكي',
      UPLINK_DESC: 'إدارة مفتاح API الآمنة',
      CONNECT_KEY: 'إنشاء_ارتباط',
      KEY_ACTIVE: 'الارتباط_نشط',
      KEY_INACTIVE: 'الارتباط_غير_متصل',
      BILLING_INFO: 'يتطلب مشروع Google Cloud مدفوع',
      MANUAL_KEY_LABEL: 'مفتاح Gemini API',
      MANUAL_KEY_PLACEHOLDER: 'أدخل مفتاح Gemini API الخاص بك'
    }
  };

  const t = translations[lang];

  return (
    <div className={`space-y-12 pb-40 animate-in fade-in duration-700 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="border-b border-white/10 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <span className="h-0.5 w-10 bg-cyan-400"></span>
             <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.6em]">AEGIS_PRISM_SETTINGS</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic">{t.TITLE}<span className="text-cyan-400">_</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-10 space-y-12 bg-white/[0.01]">
          <div className="flex items-center gap-6 border-b border-white/10 pb-8">
            <div className="w-14 h-14 border border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.2)] rounded-2xl">
              <i className="fas fa-sliders text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest italic">{t.INTERFACE}</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{t.VARS}</p>
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex items-center justify-between p-8 border border-white/10 hover:border-cyan-400/40 transition-all group cursor-pointer rounded-3xl" onClick={() => setTelemetry(!telemetry)}>
              <div className="space-y-1">
                <h3 className="text-cyan-400 font-black text-sm uppercase tracking-widest">{t.ARTIFACTS}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{t.ARTIFACTS_DESC}</p>
              </div>
              <div className={`w-12 h-6 border transition-all rounded-full p-1 ${telemetry ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10'}`}>
                 <div className={`w-4 h-full bg-cyan-400 transition-all rounded-full ${telemetry ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>

            <div className="space-y-4">
               <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-2">{t.LANG}</label>
               <div className="flex gap-4">
                  <button onClick={() => setLang('en')} className={`flex-1 py-5 border font-black text-[10px] tracking-widest uppercase transition-all rounded-2xl ${lang === 'en' ? 'bg-cyan-400 text-black border-cyan-400 shadow-lg shadow-cyan-400/20' : 'bg-white/5 border-white/10 text-slate-500 hover:text-cyan-400'}`}>English</button>
                  <button onClick={() => setLang('ar')} className={`flex-1 py-5 border font-black text-[10px] tracking-widest uppercase transition-all rounded-2xl ${lang === 'ar' ? 'bg-cyan-400 text-black border-cyan-400 shadow-lg shadow-cyan-400/20' : 'bg-white/5 border-white/10 text-slate-500 hover:text-cyan-400'}`}>العربية</button>
               </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-10 space-y-12 bg-white/[0.01]">
           <div className="flex items-center gap-6 border-b border-white/10 pb-8">
            <div className="w-14 h-14 border border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.2)] rounded-2xl">
              <i className="fas fa-satellite-dish text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest italic">{t.UPLINK}</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{t.UPLINK_DESC}</p>
            </div>
          </div>

          <div className="space-y-8">
             <div className="p-8 border border-white/10 rounded-3xl bg-black/40 space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${hasKey ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.6)]' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{hasKey ? t.KEY_ACTIVE : t.KEY_INACTIVE}</span>
                   </div>
                   {!hasKey && (
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t.BILLING_INFO}</span>
                   )}
                </div>

                <button 
                  onClick={handleConnectKey}
                  className="w-full py-6 btn-action text-[11px] font-black tracking-[0.4em] uppercase rounded-2xl flex items-center justify-center gap-4"
                >
                   <i className="fas fa-key"></i> {t.CONNECT_KEY}
                </button>

                <div className="space-y-4 pt-4 border-t border-white/5">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                      {t.MANUAL_KEY_LABEL}
                   </label>
                   <div className="relative">
                      <input 
                        type="password"
                        value={manualKey}
                        onChange={(e) => handleManualKeyChange(e.target.value)}
                        placeholder={t.MANUAL_KEY_PLACEHOLDER}
                        className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-cyan-400 font-mono text-xs tracking-widest outline-none focus:border-cyan-400/50 transition-all"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600">
                         <i className={`fas ${manualKey ? 'fa-lock text-cyan-400' : 'fa-unlock-alt'}`}></i>
                      </div>
                   </div>
                </div>

                <p className="text-[9px] text-slate-500 font-medium leading-relaxed opacity-60">
                   {lang === 'en' 
                     ? "Establishing a tactical uplink allows the Aegis core to utilize your high-privilege API credentials for unthrottled offensive operations. All keys are managed securely via the platform vault."
                     : "يسمح إنشاء ارتباط تكتيكي لنواة إيجيس باستخدام أوراق اعتماد API عالية الامتياز الخاصة بك للعمليات الهجومية غير المقيدة. يتم إدارة جميع المفاتيح بشكل آمن عبر خزنة النظام الأساسي."}
                </p>
                
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] text-cyan-400/60 hover:text-cyan-400 underline block text-center uppercase tracking-widest font-black"
                >
                   {lang === 'en' ? 'View Billing Documentation' : 'عرض وثائق الفوترة'}
                </a>
             </div>
          </div>
        </div>

        <div className="glass-panel p-10 space-y-12 bg-white/[0.01]">
           <div className="flex items-center gap-6 border-b border-white/10 pb-8">
            <div className="w-14 h-14 border border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.2)] rounded-2xl">
              <i className="fas fa-user-secret text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest italic">{t.IDENTITY}</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">OPERATOR_PROFILE</p>
            </div>
          </div>

          <div className="space-y-8">
             <div className="p-8 border border-white/5 rounded-3xl bg-black/40 space-y-6">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">CODENAME</span>
                   <span className="text-sm font-black text-cyan-400 uppercase tracking-widest">{user.username}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">UPLINK_ID</span>
                   <span className="text-sm font-black text-white uppercase tracking-widest font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t.CLEARANCE}</span>
                   <span className="px-3 py-1 bg-cyan-400 text-black text-[10px] font-black rounded-lg">{user.clearance}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
