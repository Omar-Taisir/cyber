
import React, { useState } from 'react';
import { analyzeCode, DeobfuscationResponse } from '../services/geminiService';

interface DeobfuscatorProps {
  onAudit: (event: string, details: string) => void;
  lang: 'en' | 'ar';
}

const Deobfuscator: React.FC<DeobfuscatorProps> = ({ onAudit, lang }) => {
  const [inputCode, setInputCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DeobfuscationResponse | null>(null);

  const handleAnalyze = async () => {
    if (!inputCode.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    onAudit("Code Analysis Initiated", "Staged potentially malicious artifact for neural review.");
    
    try {
      const data = await analyzeCode(inputCode);
      setResult(data);
      onAudit("Analysis Complete", `Risk Level: ${data.riskScore}/100`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const t = {
    en: {
      TITLE: 'Deob_Lab',
      SUB: 'Reverse Engineering Suite',
      INPUT: 'Staging_Area',
      EXECUTE: 'NEURAL_RECON',
      WORKING: 'DECODING...',
      RESULT: 'CLEANED_CODE',
      ANALYSIS: 'MECHANICAL_LOGIC',
      INDICATORS: 'SUSPICIOUS_NODES'
    },
    ar: {
      TITLE: 'مختبر_التفكيك',
      SUB: 'جناح الهندسة العكسية',
      INPUT: 'منطقة_التدقيق',
      EXECUTE: 'استطلاع_عصبي',
      WORKING: 'جاري التفكيك...',
      RESULT: 'الشيفرة_المنقحة',
      ANALYSIS: 'المنطق_الميكانيكي',
      INDICATORS: 'العقد_المشبوهة'
    }
  }[lang];

  return (
    <div className={`space-y-10 pb-40 animate-in fade-in duration-700 ${lang === 'ar' ? 'font-arabic text-right' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="border-b border-white/5 pb-10">
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-4">
             <span className="bg-cyan-400 text-black px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded">REV_ENG_v2.0</span>
             <span className="text-cyan-400 text-[9px] font-black uppercase tracking-[0.4em] opacity-60">{t.SUB}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic break-words">{t.TITLE}<span className="text-cyan-400">_</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
           <div className="glass-panel p-8 space-y-6 bg-white/[0.01]">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.INPUT}</label>
              <textarea 
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Paste obfuscated JS, PHP, or Base64 blobs..."
                className="w-full h-96 bg-black border border-white/10 rounded-3xl p-6 text-xs text-cyan-400 font-mono focus:border-cyan-400/50 outline-none transition-all resize-none leading-relaxed"
              />
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputCode.trim()}
                className="w-full py-5 btn-action text-xs tracking-widest flex items-center justify-center gap-4 active:scale-95 disabled:opacity-20"
              >
                {isAnalyzing ? <><i className="fas fa-circle-notch fa-spin"></i> {t.WORKING}</> : <><i className="fas fa-brain"></i> {t.EXECUTE}</>}
              </button>
           </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
           {result ? (
             <div className="animate-in slide-in-from-right-4 space-y-8">
                <div className="glass-panel p-8 bg-black/40 border-cyan-400/20">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{t.ANALYSIS}</h3>
                      <div className={`px-4 py-1 rounded-full text-[9px] font-black ${result.riskScore > 70 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'}`}>
                        RISK: {result.riskScore}%
                      </div>
                   </div>
                   <p className="text-[13px] text-slate-300 leading-relaxed font-medium">{result.analysis}</p>
                </div>

                <div className="glass-panel p-8 space-y-6">
                   <h3 className="text-[11px] font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">{t.RESULT}</h3>
                   <div className="bg-black/60 rounded-2xl p-6 border border-white/5 font-mono text-[11px] text-cyan-400/80 overflow-x-auto max-h-96 custom-scrollbar">
                      <pre>{result.deobfuscatedCode}</pre>
                   </div>
                </div>

                <div className="glass-panel p-8 space-y-4">
                   <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{t.INDICATORS}</h3>
                   <div className="flex flex-wrap gap-2">
                      {result.indicators.map((ind, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-500/5 border border-red-500/10 text-red-500 text-[9px] font-black uppercase rounded-lg">
                          <i className="fas fa-triangle-exclamation mr-2"></i> {ind}
                        </span>
                      ))}
                   </div>
                </div>
             </div>
           ) : !isAnalyzing && (
             <div className="h-full flex flex-col items-center justify-center py-20 opacity-10 grayscale gap-6">
                <i className="fas fa-dna text-7xl"></i>
                <p className="text-[11px] font-black uppercase tracking-[0.5em]">Awaiting_Artifact_Input</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Deobfuscator;
