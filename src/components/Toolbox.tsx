
import React, { useState, useMemo } from 'react';
import { TOOLS_DATABASE } from '../constants';
import { getToolAdvice, ToolAdviceResponse } from '../services/geminiService';
import { HackingTool } from '../types';

type DifficultyFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

interface ToolboxProps {
  lang: 'en' | 'ar';
}

const Toolbox: React.FC<ToolboxProps> = ({ lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('All');
  const [selectedToolAdvice, setSelectedToolAdvice] = useState<ToolAdviceResponse | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    return TOOLS_DATABASE.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'All' || t.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [searchTerm, selectedDifficulty]);

  const groupedTools = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, HackingTool[]>);
  }, [filteredTools]);

  const fetchAdvice = async (tool: HackingTool) => {
    setSelectedToolAdvice(null);
    setLoadingAdvice(tool.name);
    try {
      const advice = await getToolAdvice(tool.name, "Isolated Tactical Lab");
      setSelectedToolAdvice(advice);
    } catch (err) {
      setSelectedToolAdvice({ text: "CRITICAL_ERR: INTEL_DROPPED", sources: [] });
    } finally {
      setLoadingAdvice(null);
    }
  };

  const t = {
    en: {
      TITLE: 'Arsenal_DB',
      SUB: 'OFFENSIVE ASSET REPOSITORY',
      SEARCH: 'Query binary database...',
      INTEL: 'UPLINK INTEL',
      OBJECTS: 'Sync Objects'
    },
    ar: {
      TITLE: 'قاعدة_بيانات_الترسانة',
      SUB: 'مستودع الأصول الهجومية',
      SEARCH: 'استعلام قاعدة البيانات...',
      INTEL: 'ربط المعلومات',
      OBJECTS: 'مزامنة الكائنات'
    }
  }[lang];

  return (
    <div className={`space-y-12 pb-40 animate-in fade-in duration-700 ${lang === 'ar' ? 'font-arabic text-right' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b border-white/5 pb-10">
        <div className="space-y-2 w-full md:w-auto">
           <div className="flex items-center gap-3">
              <span className="w-1 h-1 bg-cyan-400"></span>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">{t.SUB}</span>
           </div>
           <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tighter uppercase italic break-words">{t.TITLE}</h1>
           <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] opacity-60">{TOOLS_DATABASE.length} {t.OBJECTS}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
          <div className="flex flex-wrap justify-center bg-white/5 border border-white/10 p-1 rounded-2xl w-full sm:w-auto">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <button 
                key={level} 
                onClick={() => setSelectedDifficulty(level as DifficultyFilter)} 
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl ${selectedDifficulty === level ? 'bg-cyan-400 text-black' : 'text-slate-500 hover:text-white'}`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80 group">
             <i className={`fas fa-search absolute ${lang === 'ar' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-cyan-400 transition-colors`}></i>
             <input
               type="text"
               placeholder={t.SEARCH}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className={`w-full bg-black border border-white/10 ${lang === 'ar' ? 'pr-14 pl-5' : 'pl-14 pr-5'} py-4 text-xs font-mono tracking-widest rounded-2xl outline-none focus:border-cyan-400/50 shadow-inner`}
             />
          </div>
        </div>
      </header>

      {selectedToolAdvice && (
        <div className="glass-panel p-10 border-cyan-400/50 border-2 animate-in slide-in-from-top-4 duration-500 overflow-hidden bg-black relative shadow-2xl shadow-cyan-400/10">
          <div className={`absolute top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} p-6`}>
            <button onClick={() => setSelectedToolAdvice(null)} className="text-cyan-400 hover:text-white transition-all bg-white/5 w-10 h-10 rounded-full flex items-center justify-center border border-white/10"><i className="fas fa-times text-base"></i></button>
          </div>
          <div className="flex items-center gap-6 mb-10 border-b border-white/5 pb-8">
            <div className="w-16 h-16 border border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.4)] rounded-2xl"><i className="fas fa-terminal text-2xl"></i></div>
            <div>
              <h3 className="text-white font-black uppercase text-3xl tracking-tighter italic">Technical_Intel: {loadingAdvice}</h3>
              <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.4em] opacity-60">Source: Aegis Autonomous Engine</p>
            </div>
          </div>
          <div className={`text-cyan-400 text-sm font-medium whitespace-pre-wrap leading-relaxed max-w-6xl font-mono opacity-80 border-${lang === 'ar' ? 'r' : 'l'} border-cyan-400/30 ${lang === 'ar' ? 'pr-8' : 'pl-8'}`}>
            {selectedToolAdvice.text}
            
            {/* Display verification sources as required by Gemini grounding guidelines */}
            {selectedToolAdvice.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-cyan-400/20">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic opacity-60">Grounding_Context:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedToolAdvice.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] bg-cyan-400/5 text-cyan-400/60 border border-cyan-400/20 px-3 py-1.5 rounded-lg hover:text-white hover:bg-cyan-400/20 transition-all flex items-center gap-2"
                    >
                      <i className="fas fa-link text-[8px]"></i> {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-24">
        {(Object.entries(groupedTools) as [string, HackingTool[]][]).map(([category, tools]) => (
          <div key={category} className="space-y-8">
            <div className="flex items-center gap-8 px-2">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.8em] italic whitespace-nowrap">{category}</h2>
              <div className="h-[0.5px] flex-1 bg-white/10"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool, idx) => (
                <div key={idx} className="glass-panel p-8 border-white/5 hover:border-cyan-400/40 group flex flex-col transition-all overflow-hidden bg-white/[0.01]">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-400/40 group-hover:bg-cyan-400/5 transition-all rounded-2xl shadow-inner">
                      <i className={`fas ${tool.icon} text-lg`}></i>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-white truncate italic uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">{tool.name}</h3>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 group-hover:text-cyan-400 border border-white/10 group-hover:border-cyan-400 px-2 py-0.5 mt-1.5 inline-block rounded-lg transition-all">{tool.difficulty}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 group-hover:text-slate-300 mb-8 flex-1 leading-relaxed transition-all font-medium opacity-80">{tool.description}</p>
                  
                  <div className="space-y-4">
                     <div className="bg-black/80 p-4 border border-white/5 font-mono text-[10px] text-cyan-400/40 group-hover:text-cyan-400 transition-all truncate rounded-xl shadow-inner italic">
                        $ {tool.usage}
                     </div>
                     <button 
                       onClick={() => fetchAdvice(tool)} 
                       disabled={loadingAdvice === tool.name} 
                       className="w-full py-4 btn-action text-[10px] disabled:opacity-20 rounded-2xl shadow-xl shadow-cyan-400/5"
                     >
                       {loadingAdvice === tool.name ? <i className="fas fa-circle-notch fa-spin"></i> : t.INTEL}
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Toolbox;
