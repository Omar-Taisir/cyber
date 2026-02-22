
import React, { useState, useEffect, useRef } from 'react';
import { Host, ScanLog } from '../types';
import { generateNetworkIntel } from '../services/geminiService';
import NetworkVisualizer from './NetworkVisualizer';

interface NetworkModuleProps {
  onAudit: (event: string, details: string) => void;
  lang: 'en' | 'ar';
  syncedHosts: Host[];
  onSyncHosts: (hosts: Host[]) => Promise<void>;
}

const NetworkModule: React.FC<NetworkModuleProps> = ({ onAudit, lang, syncedHosts, onSyncHosts }) => {
  const [range, setRange] = useState('10.0.0.0/24');
  const [isScanning, setIsScanning] = useState(false);
  const [localHosts, setLocalHosts] = useState<Host[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Combine local and synced hosts
  const displayHosts = [...localHosts, ...syncedHosts.filter(sh => !localHosts.some(lh => lh.ip === sh.ip))];
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: ScanLog['type'] = 'info') => {
    setScanLogs(prev => [...prev, { msg, type }]);
  };

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollTop = consoleEndRef.current.scrollHeight;
    }
  }, [scanLogs]);

  const startScan = async () => {
    if (!range) return;
    setIsScanning(true);
    setLocalHosts([]);
    setScanLogs([]);
    setScanProgress(0);
    onAudit("Network Recon", `Target subnet: ${range}`);

    try {
      addLog(`Initializing discovery daemon...`, 'ai');
      setScanProgress(10);
      
      const phases = ["ARP_SWEEP", "ICMP_PROBE", "DNS_LOOKUP", "PORT_SYNC", "BANNER_PARSE"];
      for (const p of phases) {
        addLog(`Phase: ${p} engaged...`, 'info');
        setScanProgress(prev => prev + 20);
        await new Promise(r => setTimeout(r, 600));
      }

      const response = await generateNetworkIntel(range);
      addLog(`MAPPING COMPLETE: ${response.hosts.length} NODES LOGGED.`, 'success');
      setLocalHosts(response.hosts);
      await onSyncHosts(response.hosts);
      setScanProgress(100);
    } catch (err: any) {
      addLog(`ENGINE_FAULT: ${err.message}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const t = {
    en: {
      TITLE: 'Nodes_Scan',
      SUB: 'Subnet_Enumeration',
      LABEL: 'Target_CIDR',
      EXECUTE: 'INIT_DISCOVERY',
      SCANNING: 'SCANNING...'
    },
    ar: {
      TITLE: 'فحص_العقد',
      SUB: 'تعداد_الشبكة_الفرعية',
      LABEL: 'نطاق_العنوان_الهدف',
      EXECUTE: 'بدء_الاكتشاف',
      SCANNING: 'جاري_الفحص...'
    }
  }[lang];

  return (
    <div className={`space-y-12 pb-40 animate-in fade-in duration-1000 ${lang === 'ar' ? 'font-arabic text-right' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="border-b border-white/10 pb-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className={`flex items-center gap-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
               <span className="h-1 w-10 bg-cyan-400"></span>
               <span className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.8em]">{t.SUB}</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic">{t.TITLE}<span className="text-cyan-400">_</span></h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 glass-panel p-10 space-y-10 border-white/5">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">{t.LABEL}</label>
            <input 
              type="text" 
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-cyan-400 font-mono text-sm tracking-widest outline-none focus:border-cyan-400/50"
              placeholder="10.0.0.0/24"
            />
          </div>
          <button
            onClick={startScan}
            disabled={isScanning || !range}
            className="w-full py-6 btn-action text-xs tracking-[0.6em] rounded-2xl"
          >
            {isScanning ? t.SCANNING : t.EXECUTE}
          </button>
        </div>

        <div className="xl:col-span-7 glass-panel p-8 flex flex-col h-[350px] border-white/5">
           <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-2 text-slate-500 rounded-xl bg-black/60 p-6 shadow-inner">
              {scanLogs.map((log, i) => (
                <div key={i} className={`${log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-cyan-400' : 'text-slate-600'}`}>
                  [{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}] {log.msg}
                </div>
              ))}
              <div ref={consoleEndRef} />
           </div>
           <div className="mt-4 h-1 w-full bg-black rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(0,242,255,0.4)]"
                style={{ width: `${scanProgress}%` }}
              ></div>
           </div>
        </div>
      </div>

      {displayHosts.length > 0 && (
        <NetworkVisualizer hosts={displayHosts} lang={lang} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayHosts.map(h => (
          <div key={h.ip} className="glass-panel p-8 border-white/5 hover:border-cyan-400 transition-all">
            <div className={`flex items-center gap-6 mb-8 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className="w-14 h-14 border border-white/10 rounded-2xl flex items-center justify-center text-cyan-400">
                <i className="fas fa-server"></i>
              </div>
              <div className={lang === 'ar' ? 'text-right' : ''}>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{h.hostname || 'UNKNOWN_NODE'}</h3>
                <p className="text-[10px] text-cyan-400/60 font-mono tracking-widest">{h.ip}</p>
              </div>
            </div>
            <div className="space-y-3 border-t border-white/5 pt-6 font-mono text-[10px] text-slate-500">
              <p className={lang === 'ar' ? 'flex justify-between flex-row-reverse' : 'flex justify-between'}>
                <span>{lang === 'ar' ? 'نظام التشغيل' : 'OS'}:</span> <span className="text-white">{h.os}</span>
              </p>
              <p className={lang === 'ar' ? 'flex justify-between flex-row-reverse' : 'flex justify-between'}>
                <span>{lang === 'ar' ? 'المورد' : 'VENDOR'}:</span> <span className="text-white">{h.vendor}</span>
              </p>
              <div className="space-y-2 pt-2">
                <p className="text-slate-600 uppercase tracking-widest border-b border-white/5 pb-1 mb-2">
                  {lang === 'ar' ? 'المنافذ والخدمات' : 'PORTS_&_SERVICES'}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {h.ports.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-black">{p.port}</span>
                        <span className="text-slate-400">/tcp</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{p.service}</p>
                        <p className="text-[8px] text-slate-600">{p.version}</p>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        p.severity === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                        p.severity === 'medium' ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkModule;
