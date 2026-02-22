import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../types';

interface DashboardProps {
  auditLogs: AuditLogEntry[];
  lang: 'en' | 'ar';
}

const Dashboard: React.FC<DashboardProps> = ({ auditLogs, lang }) => {
  const [threats, setThreats] = useState<string[]>([]);

  useEffect(() => {
    const mockThreats = [
      "CRITICAL: CVE-2025-0122 [0-Day] RCE detected in Global CDN Edge Nodes",
      "INFO: Massive Exfiltration event detected in APAC Finance Sector",
      "WARN: New Sliver C2 Infrastructure identified in 182.0.0.0/16",
      "ALARM: Aegis Neural Link observed unusual entropy spike in Prism Chain",
      "NOTICE: Google Search grounding indicates 40% increase in supply-chain attacks this week"
    ];
    setThreats(mockThreats);
  }, []);

  const t = {
    en: {
      TITLE: 'Operational_Control',
      CORE_VER: 'AEGIS_PRISM_v9.8',
      STATUS: 'Mesh_Sync: Active',
      STRENGTH: 'HARDENING_INDEX',
      BREACH: 'KERNEL_HEALTH',
      ACTIVE: 'NOMINAL',
      METRIC_1: 'AUDIT_VECTORS',
      METRIC_2: 'ENTROPY_INDEX',
      METRIC_3: 'PIVOT_LATENCY',
      METRIC_4: 'NEURAL_NODES',
      MAPPING_TITLE: 'OFFENSIVE_SURFACE_TOPOLOGY',
      INFIL_READY: 'AEGIS_ORCHESTRATOR_SYNCED',
      EVENT_LOG: 'LIVE_AUDIT_STREAM',
      LISTENING: 'Awaiting telemetry uplink...',
      THREAT_FEED: 'GLOBAL_THREAT_INTEL'
    },
    ar: {
      TITLE: 'التحكم_التشغيلي',
      CORE_VER: 'إيجيس_بريزم_V9.8',
      STATUS: 'مزامنة_الشبكة: نشط',
      STRENGTH: 'مؤشر التحصين',
      BREACH: 'صحة النواة',
      ACTIVE: 'اسمي',
      METRIC_1: 'نواقل التدقيق',
      METRIC_2: 'مؤشر الإنتروبيا',
      METRIC_3: 'تأخير المحور',
      METRIC_4: 'العقد العصبية',
      MAPPING_TITLE: 'تخطيط السطح الهجومي',
      INFIL_READY: 'تمت مزامنة المنسق',
      EVENT_LOG: 'بث التدقيق المباشر',
      LISTENING: 'في انتظار ربط القياس عن بعد...',
      THREAT_FEED: 'استخبارات التهديدات العالمية'
    }
  }[lang];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* CTI Ticker */}
      <div className="ticker-wrap -mx-6 md:-mx-16 mb-10">
        <div className="ticker">
          {threats.map((threat, i) => (
            <span key={i} className="mx-12 text-[10px] font-black uppercase tracking-widest text-cyan-400/80">
              <i className="fas fa-triangle-exclamation mr-2 text-red-500"></i> {threat}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {threats.map((threat, i) => (
            <span key={`dup-${i}`} className="mx-12 text-[10px] font-black uppercase tracking-widest text-cyan-400/80">
              <i className="fas fa-triangle-exclamation mr-2 text-red-500"></i> {threat}
            </span>
          ))}
        </div>
      </div>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-10 pb-10 border-b border-white/5">
        <div className="space-y-3 w-full lg:w-auto">
          <div className="flex items-center gap-4">
             <span className="bg-cyan-400 text-black px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded shadow-[0_0_20px_rgba(0,242,255,0.4)]">{t.CORE_VER}</span>
             <span className="text-cyan-400/80 text-[10px] font-black uppercase flex items-center gap-3 tracking-[0.3em]">
               <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#00f2ff]"></span>
               {t.STATUS}
             </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic break-words">{t.TITLE}<span className="text-cyan-400 opacity-40 animate-pulse">_</span></h1>
        </div>
        
        <div className="flex items-center gap-6 sm:gap-10 p-6 sm:p-8 glass-panel bg-white/[0.01] border-white/10 w-full lg:w-auto shadow-2xl">
          <div className="text-center lg:text-right flex-1 lg:flex-none">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] mb-2">{t.STRENGTH}</p>
            <p className="text-3xl sm:text-4xl font-black text-cyan-400 tracking-tighter">99.98<span className="text-sm opacity-50 ml-1 font-mono">DB</span></p>
          </div>
          <div className="w-[1px] h-12 sm:h-16 bg-white/5"></div>
          <div className="text-center lg:text-right flex-1 lg:flex-none">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] mb-2">{t.BREACH}</p>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">{t.ACTIVE}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t.METRIC_1, val: '2,842', status: 'SYNCHRONIZED', icon: 'fa-shield-halved' },
          { label: t.METRIC_2, val: '0xFA12', status: 'STABLE', icon: 'fa-lock' },
          { label: t.METRIC_3, val: '0.2ms', status: 'NOMINAL', icon: 'fa-bolt-lightning' },
          { label: t.METRIC_4, val: '4,096', status: 'OPTIMIZED', icon: 'fa-brain' }
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-8 group bg-white/[0.02] border-white/5 hover:border-cyan-400/40 transition-all">
            <div className="flex justify-between items-start mb-12">
               <div className="w-12 h-12 rounded-2xl border border-white/5 flex items-center justify-center text-slate-600 group-hover:text-cyan-400 group-hover:bg-cyan-400/5 transition-all">
                  <i className={`fas ${stat.icon} text-lg`}></i>
               </div>
               <span className="text-[8px] font-black px-3 py-1 rounded-full border border-white/5 text-slate-700 group-hover:text-cyan-400 transition-all uppercase tracking-widest italic">
                 {stat.status}
               </span>
            </div>
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.5em] mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-white tracking-tight group-hover:translate-x-1 transition-transform">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 glass-panel p-10 lg:p-14 h-[500px] lg:h-[700px] flex flex-col bg-white/[0.01] relative overflow-hidden">
           <div className="flex items-center justify-between mb-16 relative z-10">
              <h2 className="text-[11px] font-black text-white uppercase tracking-[0.6em] flex items-center gap-4">
                 <i className="fas fa-satellite text-cyan-400 text-lg"></i> {t.MAPPING_TITLE}
              </h2>
              <div className="flex gap-4">
                 <div className="px-3 py-1 bg-cyan-400/5 border border-cyan-400/20 rounded-lg text-[8px] text-cyan-400 font-black uppercase tracking-widest">LAYER: PHYSICAL</div>
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] text-slate-500 font-black uppercase tracking-widest">VORTEX: ON</div>
              </div>
           </div>
           
           <div className="flex-1 bg-black/60 rounded-[3rem] border border-white/5 relative flex items-center justify-center overflow-hidden shadow-inner group/map">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none group-hover/map:opacity-[0.1] transition-opacity duration-1000">
                 <div className="absolute top-0 left-0 w-full h-full [background:repeating-linear-gradient(0deg,transparent,transparent_40px,rgba(255,255,255,0.05)_40px,rgba(255,255,255,0.05)_41px)]"></div>
                 <div className="absolute top-0 left-0 w-full h-full [background:repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(255,255,255,0.05)_40px,rgba(255,255,255,0.05)_41px)]"></div>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-20">
                 <div className="w-56 h-56 lg:w-80 lg:h-80 rounded-full border border-cyan-400/10 flex items-center justify-center relative shadow-[0_0_120px_rgba(0,242,255,0.05)]">
                    <div className="absolute inset-0 border-[2px] border-cyan-400/20 rounded-full animate-[ping_5s_infinite] opacity-10"></div>
                    <div className="absolute inset-4 border-[1px] border-cyan-400/40 rounded-full animate-[spin_20s_linear_infinite] border-dashed opacity-20"></div>
                    
                    <i className="fas fa-shield-cat text-cyan-400 text-7xl lg:text-9xl drop-shadow-[0_0_50px_rgba(0,242,255,0.5)] animate-pulse"></i>
                 </div>
                 
                 <div className="text-center space-y-6">
                    <p className="text-[16px] font-black text-white uppercase tracking-[0.8em]">{t.INFIL_READY}</p>
                    <div className="flex justify-center gap-10">
                      <div className="flex items-center gap-3">
                         <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></span>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global_Infiltrations</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_green]"></span>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active_Exfil_Uplinks</span>
                      </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="xl:col-span-4 glass-panel flex flex-col h-[500px] lg:h-[700px] bg-white/[0.01]">
           <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-[11px] font-black text-white uppercase tracking-[0.5em] flex items-center gap-4">
                 <i className="fas fa-terminal text-cyan-400 text-lg"></i> {t.EVENT_LOG}
              </h2>
           </div>
           
           <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar font-mono text-[11px] bg-black/40">
              {auditLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale text-center py-20 px-10">
                   <i className="fas fa-wave-square text-6xl mb-10 opacity-20"></i>
                   <p className="text-[12px] uppercase tracking-[0.6em] font-black text-white">{t.LISTENING}</p>
                </div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={idx} className="group border-l-2 border-white/5 hover:border-cyan-400 pl-6 py-4 transition-all bg-white/[0.01] rounded-r-2xl">
                     <div className="flex justify-between items-center mb-2.5">
                        <span className="text-cyan-400/60 group-hover:text-cyan-400 font-black uppercase tracking-[0.3em] transition-colors">[{log.event}]</span>
                        <span className="text-slate-800 text-[10px] font-black tracking-widest">{new Date(log.timestamp).toLocaleTimeString()}</span>
                     </div>
                     <p className="text-slate-500 group-hover:text-slate-300 transition-colors leading-relaxed opacity-80">{log.details}</p>
                  </div>
                ))
              )}
           </div>
           
           <div className="p-8 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Auto_Pruning: Enabled</span>
              <span className="text-[10px] font-black text-cyan-400/40 uppercase mono">STACK_OK</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;