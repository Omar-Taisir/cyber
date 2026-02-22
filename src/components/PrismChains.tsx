
import React, { useState } from 'react';
import { EncryptionMode, PrismChain } from '../types';
import { MODES_METADATA } from '../constants';

interface PrismChainsProps {
  chains: PrismChain[];
  onAddChain: (chain: PrismChain) => void;
  onDeleteChain: (id: string) => void;
  lang: 'en' | 'ar';
}

const PrismChains: React.FC<PrismChainsProps> = ({ chains, onAddChain, onDeleteChain, lang }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newChainName, setNewChainName] = useState('');
  const [newChainDesc, setNewChainDesc] = useState('');
  const [selectedModes, setSelectedModes] = useState<EncryptionMode[]>([]);

  const availableModes = Object.entries(MODES_METADATA).filter(([key]) => key !== EncryptionMode.UNIFIED_PRISM);

  const handleAddMode = (mode: EncryptionMode) => {
    setSelectedModes([...selectedModes, mode]);
  };

  const handleRemoveMode = (index: number) => {
    setSelectedModes(selectedModes.filter((_, i) => i !== index));
  };

  const handleSaveChain = () => {
    if (!newChainName || selectedModes.length === 0) return;
    
    const newChain: PrismChain = {
      id: `CHAIN-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newChainName,
      description: newChainDesc,
      modes: selectedModes,
      createdAt: new Date().toISOString()
    };
    
    onAddChain(newChain);
    setIsCreating(false);
    setNewChainName('');
    setNewChainDesc('');
    setSelectedModes([]);
  };

  const t = {
    en: {
      TITLE: 'Prism_Chains',
      SUB: 'Cryptographic Sequence Architect',
      CREATE: 'Initialize New Chain',
      NAME: 'Chain Identifier',
      DESC: 'Operational Description',
      MODES: 'Available Protocols',
      SEQUENCE: 'Active Sequence',
      SAVE: 'Commit Chain',
      CANCEL: 'Abort',
      EMPTY: 'No custom chains detected in local buffer.',
      DELETE: 'Purge'
    },
    ar: {
      TITLE: 'سلاسل_بريزم',
      SUB: 'مهندس التسلسل التشفيري',
      CREATE: 'تهيئة سلسلة جديدة',
      NAME: 'معرف السلسلة',
      DESC: 'الوصف التشغيلي',
      MODES: 'البروتوكولات المتاحة',
      SEQUENCE: 'التسلسل النشط',
      SAVE: 'اعتماد السلسلة',
      CANCEL: 'إلغاء',
      EMPTY: 'لم يتم اكتشاف سلاسل مخصصة في المخزن المحلي.',
      DELETE: 'حذف'
    }
  }[lang];

  return (
    <div className={`space-y-12 pb-40 animate-in fade-in duration-700 ${lang === 'ar' ? 'font-arabic text-right' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 bg-cyan-400 animate-pulse"></span>
             <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">{t.SUB}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">{t.TITLE}<span className="text-cyan-400">_</span></h1>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-8 py-4 bg-cyan-400 text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all"
          >
            <i className="fas fa-plus mr-2"></i> {t.CREATE}
          </button>
        )}
      </header>

      {isCreating && (
        <div className="glass-panel p-10 space-y-10 bg-white/[0.01] border-cyan-400/30 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2">{t.NAME}</label>
                <input 
                  type="text" 
                  value={newChainName}
                  onChange={(e) => setNewChainName(e.target.value)}
                  placeholder="e.g. VORTEX-ALPHA"
                  className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm text-cyan-400 focus:border-cyan-400/50 outline-none transition-all font-mono"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2">{t.DESC}</label>
                <textarea 
                  value={newChainDesc}
                  onChange={(e) => setNewChainDesc(e.target.value)}
                  placeholder="Describe the security context..."
                  className="w-full h-32 bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-400 focus:border-cyan-400/50 outline-none transition-all font-mono resize-none"
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2">{t.SEQUENCE}</label>
                <div className="min-h-[120px] p-6 bg-black/40 border border-white/5 rounded-3xl flex flex-wrap gap-3">
                  {selectedModes.length === 0 ? (
                    <span className="text-[10px] text-slate-700 font-black uppercase tracking-widest flex items-center justify-center w-full italic">Awaiting_Protocol_Selection...</span>
                  ) : (
                    selectedModes.map((mode, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-cyan-400 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest group">
                        <span>{idx + 1}. {MODES_METADATA[mode].name}</span>
                        <button onClick={() => handleRemoveMode(idx)} className="hover:text-red-600 transition-colors"><i className="fas fa-times"></i></button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2">{t.MODES}</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableModes.map(([key, meta]) => (
                    <button 
                      key={key}
                      onClick={() => handleAddMode(key as EncryptionMode)}
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-cyan-400 hover:text-white transition-all text-left flex items-center justify-between group"
                    >
                      <span>{meta.name}</span>
                      <i className="fas fa-plus opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button 
              onClick={() => setIsCreating(false)}
              className="px-8 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              {t.CANCEL}
            </button>
            <button 
              onClick={handleSaveChain}
              disabled={!newChainName || selectedModes.length === 0}
              className="px-10 py-4 bg-cyan-400 text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all disabled:opacity-20"
            >
              {t.SAVE}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chains.map((chain) => (
          <div key={chain.id} className="glass-panel p-8 space-y-6 bg-white/[0.01] border-white/5 hover:border-cyan-400/30 transition-all group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic group-hover:text-cyan-400 transition-colors">{chain.name}</h3>
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{chain.id}</p>
              </div>
              <button 
                onClick={() => onDeleteChain(chain.id)}
                className="text-slate-700 hover:text-red-500 transition-colors p-2"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500 line-clamp-2 min-h-[32px]">{chain.description}</p>
            
            <div className="space-y-3">
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Chain_Sequence:</p>
              <div className="flex flex-wrap gap-2">
                {chain.modes.map((mode, idx) => (
                  <span key={idx} className="px-3 py-1 bg-black/60 border border-white/5 text-cyan-400/60 text-[8px] font-black uppercase rounded-lg">
                    {MODES_METADATA[mode].name.split('-')[0]}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
               <span className="text-[8px] text-slate-700 font-black uppercase tracking-widest">TS: {new Date(chain.createdAt).toLocaleDateString()}</span>
               <span className="text-[8px] text-cyan-400/40 font-black uppercase tracking-widest">{chain.modes.length}_LAYERS</span>
            </div>
          </div>
        ))}

        {chains.length === 0 && !isCreating && (
          <div className="col-span-full py-32 text-center opacity-10 flex flex-col items-center gap-6 grayscale">
            <i className="fas fa-link-slash text-7xl"></i>
            <p className="text-[11px] font-black uppercase tracking-[0.5em]">{t.EMPTY}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrismChains;
