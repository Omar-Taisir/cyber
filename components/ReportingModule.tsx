
import React, { useState } from 'react';
import { Report, AuditLogEntry } from '../types';

interface ReportingModuleProps {
  auditLogs?: AuditLogEntry[];
  lang: 'en' | 'ar';
}

const ReportingModule: React.FC<ReportingModuleProps> = ({ auditLogs = [], lang }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>([
    { id: 'INF-09-X', title: 'Edge Node Breach Artifacts', status: 'Finalized', date: '2025-05-12T14:30:00Z', owner: 'OP_CYAN', data: [] },
    { id: 'INF-12-P', title: 'Internal Network Pivot Map', status: 'Finalized', date: '2025-05-11T09:15:00Z', owner: 'OP_CYAN', data: [] },
  ]);

  const summaryMetrics = [
    { label: 'BREACH_EVENTS', val: auditLogs.length.toString(), color: 'text-cyan-400', icon: 'fa-skull-crossbones' },
    { label: 'PIVOT_POINTS', val: '04', color: 'text-cyan-400', icon: 'fa-route' },
    { label: 'EXFIL_BYTES', val: '1.2 GB', color: 'text-cyan-400', icon: 'fa-file-export' },
    { label: 'THREAT_SCORE', val: 'NOMINAL', color: 'text-cyan-400', icon: 'fa-shield-halved' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newReport: Report = {
        id: `INF-${Math.floor(10 + Math.random() * 89)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        title: `Operation_Artifact_${new Date().toLocaleDateString()}`,
        status: 'Finalized',
        date: new Date().toISOString(),
        owner: 'DAEMON_SYSTEM',
        data: []
      };
      setReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
    }, 1200);
  };

  const downloadReport = (report: Report) => {
    const exportData = {
      ...report,
      telemetry_stream: auditLogs,
      security_context: {
        engine: "VORTEX-CYAN-DAEMON V9.0",
        classification: "AEGIS_RESTRICTED"
      }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${report.id}_AEGIS_LOG.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const t = {
    en: {
      TITLE: 'Intel_Archive',
      SUB: 'Tactical_Persistence_Module',
      EXECUTE: 'SYNC_OPERATIONAL_LOG',
      WORKING: 'GENERATING...',
      ARCHIVE: 'EVENT_ARCHIVE_DAEMON',
      PURGE: 'PURGE_LOGS'
    },
    ar: {
      TITLE: 'أرشيف_المعلومات',
      SUB: 'وحدة_الاستمرار_التكتيكي',
      EXECUTE: 'مزامنة_سجل_العمليات',
      WORKING: 'جاري التوليد...',
      ARCHIVE: 'أرشيف_الأحداث',
      PURGE: 'مسح_السجلات'
    }
  }[lang];

  return (
    <div className={`space-y-10 pb-32 animate-in fade-in duration-700 ${lang === 'ar' ? 'font-arabic text-right' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2 w-full md:w-auto">
           <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <span className="w-2 h-2 bg-cyan-400 animate-ping"></span>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">{t.SUB}</span>
           </div>
           <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic break-words">{t.TITLE}<span className="text-cyan-400 animate-pulse">_</span></h1>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full md:w-auto px-8 py-4 btn-action disabled:opacity-20 flex items-center justify-center gap-4 rounded-2xl`}
        >
          {isGenerating ? <><i className="fas fa-atom fa-spin"></i> {t.WORKING}</> : <><i className="fas fa-satellite-dish"></i> {t.EXECUTE}</>}
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((s, i) => (
          <div key={i} className="glass-panel p-6 group border-white/5 hover:border-cyan-400 transition-all">
            <div className={`flex justify-between items-start mb-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
               <div className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center text-cyan-400 group-hover:border-cyan-400">
                 <i className={`fas ${s.icon} text-sm`}></i>
               </div>
            </div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1 group-hover:text-cyan-400 transition-colors">{s.label}</p>
            <p className={`text-2xl font-black text-white tracking-tighter uppercase italic`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel border-white/5 overflow-hidden">
        <div className={`p-6 border-b border-white/10 bg-cyan-400/5 flex flex-col sm:flex-row items-center justify-between gap-6 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
           <h3 className="text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
             <i className="fas fa-stream"></i> {t.ARCHIVE}
           </h3>
           <div className="flex gap-2">
              <button onClick={() => setReports([])} className="text-[8px] font-black text-slate-700 hover:text-red-500 border border-white/10 hover:border-red-500 px-4 py-2 uppercase tracking-widest rounded-lg transition-all">{t.PURGE}</button>
           </div>
        </div>
        
        <div className="divide-y divide-white/5">
          {reports.map((item, idx) => (
            <div key={idx} className={`p-8 hover:bg-cyan-400/5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between group gap-8 ${lang === 'ar' ? 'text-right' : ''}`}>
              <div className={`flex items-center gap-8 flex-1 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] font-mono text-cyan-400 border border-cyan-400/30 px-3 py-1 bg-black/60 rounded-lg">{item.id}</span>
                <div className="min-w-0">
                   <h4 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors truncate tracking-tighter uppercase italic">{item.title}</h4>
                   <div className={`flex items-center gap-6 mt-2 opacity-40 group-hover:opacity-100 transition-opacity ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">S_ID: {item.owner}</p>
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">TS: {new Date(item.date).toLocaleTimeString()}</p>
                   </div>
                </div>
              </div>
              <div className={`flex items-center gap-6 w-full md:w-auto justify-between md:justify-end ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                 <span className={`px-4 py-1 text-[8px] font-black uppercase tracking-widest border border-cyan-400/30 text-cyan-400/60 rounded-lg`}>
                   {item.status}
                 </span>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => downloadReport(item)}
                      className="w-10 h-10 border border-white/10 hover:border-cyan-400 text-slate-500 hover:text-cyan-400 transition-all flex items-center justify-center bg-black/40 rounded-lg"
                    >
                      <i className="fas fa-download text-xs"></i>
                    </button>
                 </div>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="py-24 text-center opacity-10 flex flex-col items-center gap-4 grayscale">
               <i className="fas fa-archive text-5xl mb-2 text-cyan-400"></i>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">{lang === 'ar' ? 'لا توجد سجلات محفوظة' : 'No Persisted Engagement Logs'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-6 border-white/5">
        <h3 className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4 flex items-center gap-3 italic">
           <i className="fas fa-terminal"></i> {lang === 'ar' ? 'مخزن البث المباشر' : 'LIVE_STREAM_BUFFER'}
        </h3>
        <div className={`bg-black/60 border border-white/10 rounded-2xl p-6 h-64 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-2 shadow-inner ${lang === 'ar' ? 'text-right' : ''}`}>
           {auditLogs.map((log, i) => (
             <div key={i} className={`flex gap-4 group ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span className="text-slate-800 font-bold group-hover:text-cyan-900 transition-colors">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="text-slate-600 group-hover:text-cyan-400 transition-colors uppercase tracking-widest">[{log.event}]</span>
                <span className="text-slate-700 group-hover:text-slate-300 flex-1 truncate transition-colors">{log.details}</span>
             </div>
           ))}
           {auditLogs.length === 0 && <p className="text-slate-900 animate-pulse">{lang === 'ar' ? 'في انتظار الاتصال...' : 'Awaiting connection...'}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReportingModule;
