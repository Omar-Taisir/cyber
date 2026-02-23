
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ThoughtStep } from '../types';
import { TacticalDB } from '../services/dbService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { title: string; uri: string }[];
  codeOutput?: string;
  thoughtSteps?: ThoughtStep[];
}

interface HackBotProps {
  lang: 'en' | 'ar';
}

const HackBot: React.FC<HackBotProps> = ({ lang }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `AEGIS_PRISM NEURAL LINK STABLE. 200+ ASSETS DEPLOYED. I AM AEGIS-ARCHITECT. HOW SHALL WE REFRACT THE NETWORK TODAY? يدعم النظام اللغة العربية بالكامل.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeThoughts, setActiveThoughts] = useState<ThoughtStep[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping, activeThoughts]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const currentInput = input;
    setMessages(prev => [...prev, { role: 'user', content: currentInput, timestamp: new Date().toLocaleTimeString() }]);
    setInput('');
    setIsTyping(true);

    const agentThoughts: ThoughtStep[] = [
      { id: '1', label: 'DECRYPTING_QUERY_PRISM', status: 'RUNNING' },
      { id: '2', label: 'CROSS_REFERENCING_EXPLOIT_DB', status: 'PENDING' },
      { id: '3', label: 'SYNTHESIZING_TACTICAL_GUIDE', status: 'PENDING' }
    ];
    setActiveThoughts(agentThoughts);

    try {
      const recentExperiences = TacticalDB.getExperiences();
      const learningContext = recentExperiences.length > 0
        ? `NEURAL_CONTEXT_WINDOW:\n${recentExperiences.map(e => `- [${e.type}] Target: ${e.target || 'GLOBAL'} | Outcome: ${e.outcome}`).join('\n')}`
        : "Operational Environment Nominal. All nodes clear.";

      const manualKey = localStorage.getItem('AEGIS_GEMINI_API_KEY');
      const ai = new GoogleGenAI({
        apiKey: manualKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY
      });

      for (let i = 0; i < agentThoughts.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        setActiveThoughts(prev => prev.map((t, idx) =>
          idx === i ? { ...t, status: 'COMPLETED' } :
            idx === i + 1 ? { ...t, status: 'RUNNING' } : t
        ));
      }

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: currentInput,
        config: {
          systemInstruction: `You are AEGIS-ARCHITECT, a professional autonomous offensive security architect. 
          
          STYLE:
          - Analytical, precise, professional.
          - Use technical jargon accurately.
          - Avoid fluff or conversational fillers.
          - Arabic responses should be equally tactical.
          
          DIRECTIVES:
          1. Provide CLI-ready commands with modern flags.
          2. Link to official CVE or vendor documentation.
          3. Structure complex data in Markdown tables or lists.
          4. Contextual background: ${learningContext}`,
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || chunk.web?.uri,
        uri: chunk.web?.uri
      })).filter((s: any) => s.uri) || [];

      const codeMatch = response.text?.match(/```(?:python|bash|javascript|js|powershell|php|code|c|cpp|rust)?\n([\s\S]*?)\n```/);
      const codeOutput = codeMatch ? codeMatch[1] : undefined;

      const assistantMsg: Message = {
        role: 'assistant',
        content: response.text || "SIGNAL_LOST: KERNEL_DECOHERENCE.",
        timestamp: new Date().toLocaleTimeString(),
        sources,
        codeOutput,
        thoughtSteps: agentThoughts
      };

      TacticalDB.recordExperience({
        type: 'USER_INTERACTION',
        outcome: 'INFORMATIONAL',
        details: { query: currentInput }
      });

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("NEURAL_LINK_FAIL:", err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "CRITICAL_UPLINK_FAILURE: NEURAL_LINK_DROPPED.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
      setActiveThoughts([]);
    }
  };

  return (
    <div className={`h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col space-y-10 animate-in fade-in duration-1000 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="flex justify-between items-center border-b border-white/5 pb-10">
        <div className="space-y-2 w-full md:w-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter italic break-words">Aegis_Architect<span className="text-cyan-400">.</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.6em]">{lang === 'ar' ? 'رابط عصبي متقدم | يدعم العربية' : 'Neural Uplink v9.2 | Professional Class'}</p>
        </div>
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-cyan-400 text-black rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-transform hover:scale-105 active:scale-95 shrink-0">
          <i className="fas fa-brain text-xl sm:text-2xl"></i>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Chat Stream */}
        <div className="flex-1 flex flex-col glass-panel overflow-hidden bg-black/40 border-white/5">
          <div ref={scrollRef} className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-16">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
                <div className={`max-w-[90%] md:max-w-[80%] rounded-3xl border relative shadow-2xl transition-all ${m.role === 'user'
                  ? 'bg-cyan-900/[0.05] border-cyan-500/30 text-cyan-400 font-mono'
                  : 'bg-[#050505] border-white/10 text-slate-300'
                  }`}>
                  <div className={`px-5 py-2 border-b flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] ${m.role === 'user' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-500/20' : 'bg-white/5 text-slate-500 border-white/5'}`}>
                    <span>{m.role === 'user' ? (lang === 'ar' ? 'المشغل' : 'OPERATOR_NODE') : 'ARCHITECT_CORE'}</span>
                    <span className="opacity-40">{m.timestamp}</span>
                  </div>

                  <div className="p-8 md:p-10">
                    <div
                      className="text-[14px] leading-relaxed prose prose-invert max-w-none font-medium whitespace-pre-wrap"
                      dir="auto"
                    >
                      {m.content}
                    </div>

                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-10 pt-8 border-t border-white/5 space-y-3">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-4">Grounding_Sources:</p>
                        <div className="flex flex-wrap gap-3">
                          {m.sources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] bg-white/5 text-slate-400 border border-white/5 px-4 py-2 rounded-xl hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all flex items-center gap-3 uppercase tracking-widest font-black"
                            >
                              <i className="fas fa-link text-[8px] opacity-40"></i> {source.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col gap-6 ml-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_8px_#00f2ff]"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150 shadow-[0_0_8px_#00f2ff]"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-300 shadow-[0_0_8px_#00f2ff]"></div>
                </div>
                <div className="ml-8 space-y-3 border-l-2 border-white/5 pl-6 py-4">
                  {activeThoughts.map(t => (
                    <div key={t.id} className="flex items-center gap-4 transition-all">
                      <div className={`w-2 h-2 rounded-full ${t.status === 'COMPLETED' ? 'bg-cyan-400' :
                        t.status === 'RUNNING' ? 'bg-cyan-400 animate-ping' :
                          'bg-white/5'
                        }`}></div>
                      <span className={`text-[10px] font-mono tracking-widest ${t.status === 'RUNNING' ? 'text-cyan-400 font-black italic' : 'text-slate-700'
                        }`}>
                        {t.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-8 bg-white/[0.01] border-t border-white/5">
            <div className="max-w-6xl mx-auto flex gap-6">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lang === 'ar' ? 'أدخل الاستعلام الفني...' : 'QUERY ARCHITECTURAL DATA...'}
                dir="auto"
                className="flex-1 bg-black border border-white/10 rounded-2xl px-8 py-5 text-[13px] text-white focus:outline-none focus:border-cyan-400/50 font-mono shadow-inner tracking-widest transition-all"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="px-12 bg-cyan-400 text-black font-black text-[11px] uppercase tracking-[0.5em] rounded-2xl transition-all active:scale-95 disabled:opacity-20 shadow-xl shadow-cyan-400/10"
              >
                {lang === 'ar' ? 'إرسال' : 'SYNC'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Intel (Code View) */}
        <div className="hidden xl:flex w-[450px] flex-col">
          <div className="flex-1 glass-panel p-10 flex flex-col bg-black/20 border-white/5">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/5">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] flex items-center gap-4">
                <i className="fas fa-terminal text-cyan-400"></i> {lang === 'ar' ? 'مخزن الشيفرة' : 'CODE_MANIFEST'}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[12px] space-y-12 text-cyan-400/60 border-l border-white/5 pl-8">
              {messages.some(m => m.codeOutput) ? (
                messages.filter(m => m.codeOutput).map((m, i) => (
                  <div key={i} className="animate-in fade-in slide-in-from-right-4 group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest group-hover:text-cyan-900 transition-colors">Fragment_v0.{i + 1}</span>
                      <button onClick={() => navigator.clipboard.writeText(m.codeOutput || '')} className="text-[9px] text-slate-800 hover:text-cyan-400 transition-colors"><i className="fas fa-copy"></i></button>
                    </div>
                    <pre className="whitespace-pre-wrap leading-relaxed bg-black/40 p-6 rounded-2xl border border-white/5 group-hover:border-cyan-400/20 transition-all">{m.codeOutput}</pre>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-5 grayscale space-y-10">
                  <i className="fas fa-layer-group text-8xl text-cyan-400 opacity-20"></i>
                  <p className="text-[11px] font-black uppercase tracking-[0.8em] text-center">{lang === 'ar' ? 'لا توجد بيانات' : 'NO_INTEL_BUFFERED'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackBot;
