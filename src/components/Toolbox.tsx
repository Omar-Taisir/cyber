import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { getApiKey } from '../services/geminiService';
import { ScanResult } from '../types';

interface ToolboxProps {
  lang: 'en' | 'ar';
}

const Toolbox: React.FC<ToolboxProps> = ({ lang }) => {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [sources, setSources] = useState<{ title: string, uri: string }[]>([]);

  const handleDeepScan = async () => {
    if (!target) return;
    setIsScanning(true);
    setResults([]);
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: getApiKey() as string, apiVersion: "v1beta" });

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `[SYSTEM: VULN_ENGINE_9]
            Target: ${target}
            Instruction: Perform a deep logical discovery of vulnerabilities. Reference 2024 exploits.
            Format: EXACT JSON array of ScanResult objects.`,
          config: {
            tools: [{ googleSearch: {} }] as any,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  remediation: { type: Type.STRING },
                  cvss: { type: Type.NUMBER },
                  status: { type: Type.STRING }
                },
                required: ["id", "type", "severity", "description", "remediation", "cvss", "status"]
              }
            }
          }
        });
      } catch (err) {
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `[SYSTEM: VULN_ENGINE_9]
            Target: ${target}
            Format: JSON array of ScanResult objects.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  remediation: { type: Type.STRING },
                  cvss: { type: Type.NUMBER },
                  status: { type: Type.STRING }
                },
                required: ["id", "type", "severity", "description", "remediation", "cvss", "status"]
              }
            }
          }
        });
      }

      const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || chunk.web?.uri,
        uri: chunk.web?.uri
      })).filter((s: any) => s.uri) || [];

      setSources(groundingSources);

      if (response.text) {
        const parsed = JSON.parse(response.text);
        setResults(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Deep Scan Fault", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className={`space-y-12 h-full overflow-y-auto custom-scrollbar p-1 pb-20 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="space-y-3">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Tactical_Toolbox<span className="text-cyan-400">.</span></h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.6em]">{lang === 'ar' ? 'أدوات الهجوم والدفاع المتقدمة' : 'Proactive Vulnerability Synthesis'}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 bg-black/40 border-white/5 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'تحديد الهدف' : 'TARGET_SPECIFICATION'}</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="https://target-domain.com"
                className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-[12px] text-cyan-400 focus:outline-none focus:border-cyan-400/50 font-mono transition-all"
              />
            </div>
            <button
              onClick={handleDeepScan}
              disabled={isScanning || !target}
              className="w-full bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-400/5 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 group disabled:opacity-20"
            >
              {isScanning ? (
                <>
                  <i className="fas fa-circle-notch animate-spin text-cyan-400"></i>
                  <span className="animate-pulse">{lang === 'ar' ? 'جاري التحليل...' : 'ANALYZING_TARGET...'}</span>
                </>
              ) : (
                <>
                  <i className="fas fa-radar group-hover:text-cyan-400 transition-colors"></i>
                  {lang === 'ar' ? 'بدء فحص عميق' : 'INITIATE_DEEP_SCAN'}
                </>
              )}
            </button>
          </div>

          {sources.length > 0 && (
            <div className="glass-panel p-8 bg-cyan-400/[0.02] border-cyan-400/10 animate-in fade-in slide-in-from-left-4">
              <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6 italic">{lang === 'ar' ? 'مصادر الاستخبارات' : 'INTEL_SOURCES'}_</h4>
              <div className="space-y-4">
                {sources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="block p-4 bg-black/40 border border-white/5 rounded-xl hover:border-cyan-400/20 transition-all">
                    <p className="text-[11px] font-bold text-slate-300 truncate mb-1">{s.title}</p>
                    <p className="text-[9px] text-slate-600 truncate font-mono uppercase">{s.uri}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-8">
          {results.length > 0 ? (
            results.map((r, i) => (
              <div key={i} className="glass-panel p-10 bg-black/40 border-white/5 hover:border-white/10 transition-all animate-in fade-in slide-in-from-bottom-4 group">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest ${r.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      r.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                        'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                      }`}>
                      {r.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{r.id}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{lang === 'ar' ? 'درجة الخطورة' : 'RISK_SCORE'}</p>
                    <p className="text-2xl font-black text-white italic">{r.cvss.toFixed(1)}</p>
                  </div>
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight group-hover:text-cyan-400 transition-colors italic">{r.type.replace(/_/g, ' ')}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed mb-10 max-w-3xl">{r.description}</p>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 italic">{lang === 'ar' ? 'خطة المعالجة' : 'REMEDIATION_STRATEGY'}:</p>
                  <p className="text-[12px] text-slate-300 font-mono leading-relaxed">{r.remediation}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center glass-panel bg-black/40 border-dashed border-white/5 opacity-30 min-h-[400px]">
              <i className="fas fa-radar text-6xl text-slate-800 mb-8 animate-pulse"></i>
              <p className="text-[11px] font-black uppercase tracking-[1em] text-slate-700">{lang === 'ar' ? 'انتظار الفحص' : 'AWAIT_SCAN_INIT'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbox;
