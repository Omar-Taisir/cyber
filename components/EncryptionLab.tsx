
import React, { useState, useRef } from 'react';
import { encryptData, decryptData, encryptWithChain, decryptWithChain, MODES_METADATA } from '../services/cryptoService';
import { EncryptionSuite, EncryptionMode, PrismChain } from '../types';

interface EncryptionLabProps {
  onAudit: (event: string, details: string) => void;
  lang: 'en' | 'ar';
  chains: PrismChain[];
}

const EncryptionLab: React.FC<EncryptionLabProps> = ({ onAudit, lang, chains }) => {
  const [suite, setSuite] = useState<EncryptionSuite>(EncryptionSuite.ENTERPRISE);
  const [mode, setMode] = useState<EncryptionMode | string>(EncryptionMode.UNIFIED_PRISM);
  const [inputType, setInputType] = useState<'TEXT' | 'FILE'>('TEXT');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeLayer, setActiveLayer] = useState<EncryptionMode | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [logs, setLogs] = useState<{timestamp: string, msg: string, type: 'info' | 'success' | 'err'}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string, type: 'info' | 'success' | 'err' = 'info') => {
    setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 50));
  };

  const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      addLog(`Artifact Buffer Staged: ${e.target.files.length} items.`, 'info');
    }
  };

  const handleProcess = async (op: 'encrypt' | 'decrypt') => {
    if (!password) {
      addLog("ACCESS_DENIED: MISSING_ENTROPY_KEY", 'err');
      return;
    }

    if (inputType === 'FILE' && selectedFiles.length === 0) {
      addLog("ERR: NO_FILES_SELECTED", 'err');
      return;
    }

    if (inputType === 'TEXT' && !inputText) {
      addLog("ERR: NO_TEXT_PROVIDED", 'err');
      return;
    }

    setIsProcessing(true);
    addLog(`INIT_SEQUENCE_${op.toUpperCase()}`, 'info');
    setOutputText('');
    
    try {
      const isCustomChain = typeof mode === 'string' && mode.startsWith('CHAIN-');
      const selectedChain = isCustomChain ? chains.find(c => c.id === mode) : null;

      if (inputType === 'TEXT') {
        const data = new TextEncoder().encode(inputText);
        let result: Uint8Array;
        
        if (op === 'encrypt') {
          if (selectedChain) {
            result = await encryptWithChain(data, password, selectedChain.modes, (m) => setActiveLayer(m));
          } else {
            result = await encryptData(data, password, mode as EncryptionMode, suite === EncryptionSuite.BANK, (m) => setActiveLayer(m));
          }
          const base64 = uint8ArrayToBase64(result);
          setOutputText(base64);
          addLog("TEXT_ARTIFACT_SEALED", 'success');
        } else {
          try {
            const bytes = base64ToUint8Array(inputText.trim());
            if (selectedChain) {
              result = await decryptWithChain(bytes, password, selectedChain.modes, (m) => setActiveLayer(m));
            } else {
              result = await decryptData(bytes, password, mode as EncryptionMode, (m) => setActiveLayer(m));
            }
            setOutputText(new TextDecoder().decode(result));
            addLog("TEXT_ARTIFACT_BREACHED", 'success');
          } catch (e) {
             addLog("DECRYPT_FAILED: WRONG_KEY_OR_MODE", 'err');
          }
        }
      } else {
        for (const file of selectedFiles) {
          const arrayBuffer = await file.arrayBuffer();
          let result: Uint8Array;
          
          if (op === 'encrypt') {
            if (selectedChain) {
              result = await encryptWithChain(arrayBuffer, password, selectedChain.modes, (m) => setActiveLayer(m));
            } else {
              result = await encryptData(arrayBuffer, password, mode as EncryptionMode, suite === EncryptionSuite.BANK, (m) => {
                setActiveLayer(m);
              });
            }
            const blob = new Blob([result]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name}.prism`;
            a.click();
            addLog(`FILE_SEALED: ${file.name}`, 'success');
          } else {
            if (selectedChain) {
              result = await decryptWithChain(new Uint8Array(arrayBuffer), password, selectedChain.modes, (m) => setActiveLayer(m));
            } else {
              result = await decryptData(new Uint8Array(arrayBuffer), password, mode as EncryptionMode, (m) => {
                setActiveLayer(m);
              });
            }
            const blob = new Blob([result]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace('.prism', '');
            a.click();
            addLog(`FILE_OPENED: ${file.name}`, 'success');
          }
        }
      }
      const modeName = selectedChain ? selectedChain.name : MODES_METADATA[mode as EncryptionMode].name;
      onAudit(`${suite} GRADED ${op.toUpperCase()}`, `Engine: Aegis-Prism | Mode: ${modeName}`);
    } catch (err: any) {
      addLog(`FATAL: CIPHER_INTEGRITY_FAILURE`, 'err');
    } finally {
      setIsProcessing(false);
      setActiveLayer(null);
    }
  };

  const t = {
    en: {
      TITLE: 'Cipher_Vault',
      SUB: 'Aegis Prism Cryptographic Suite',
      ARCH_MASTER: 'Master_Chain',
      ARCH_CUSTOM: 'Custom_Chains',
      ARCH_PRIMS: 'Base_Protocols',
      KEY: 'Entropy Key',
      SEAL: 'SEAL_DATA',
      BREACH: 'BREACH_LOCK',
      INPUT: 'Payload',
      OUTPUT: 'Result',
      TEXT: 'STRING',
      FILE: 'BINARY',
      COMPLIANCE: 'PCI-DSS ACTIVE',
      LOGS: 'CONSOLE_STREAM'
    },
    ar: {
      TITLE: 'خزنة_التشفير',
      SUB: 'جناح تشفير إيجيس بريزم',
      ARCH_MASTER: 'السلسلة الرئيسية',
      ARCH_CUSTOM: 'سلاسل_مخصصة',
      ARCH_PRIMS: 'بروتوكولات أساسية',
      KEY: 'مفتاح الإنتروبيا',
      SEAL: 'ختم البيانات',
      BREACH: 'خرق القفل',
      INPUT: 'الحمولة',
      OUTPUT: 'النتيجة',
      TEXT: 'نصي',
      FILE: 'ثنائي',
      COMPLIANCE: 'PCI-DSS نشط',
      LOGS: 'بث_وحدة_التحكم'
    }
  }[lang];

  const masterModeKey = EncryptionMode.UNIFIED_PRISM;
  const primitiveModes = Object.entries(MODES_METADATA).filter(([key]) => key !== masterModeKey);

  return (
    <div className={`space-y-10 pb-40 animate-in fade-in duration-700 ${lang === 'ar' ? 'font-arabic text-right' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b border-white/5 pb-10">
        <div className="space-y-2 w-full md:w-auto">
          <div className="flex items-center gap-3">
             <span className="bg-cyan-400 text-black px-2.5 py-1 text-[9px] font-black tracking-widest uppercase rounded shadow-[0_0_15px_rgba(0,242,255,0.4)]">PRISM_v9.2</span>
             <span className="text-cyan-400 text-[9px] font-black uppercase tracking-[0.4em] opacity-60">{t.SUB}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tighter uppercase italic break-words">{t.TITLE}</h1>
        </div>
        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <div className="flex flex-wrap justify-center bg-black/40 p-1 rounded-2xl border border-white/10 w-full md:w-auto shadow-inner">
            {[EncryptionSuite.PERSONAL, EncryptionSuite.ENTERPRISE, EncryptionSuite.BANK].map(s => (
              <button key={s} onClick={() => setSuite(s)} className={`flex-1 md:flex-none whitespace-nowrap px-4 sm:px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl ${suite === s ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/10' : 'text-slate-500 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
          {suite === EncryptionSuite.BANK && (
            <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full animate-pulse">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
               <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">{t.COMPLIANCE}</span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-panel p-8 md:p-10 space-y-10 bg-white/[0.01]">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
               <div className="flex gap-4">
                  <button onClick={() => setInputType('TEXT')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all border ${inputType === 'TEXT' ? 'bg-cyan-400 text-black border-cyan-400 shadow-lg shadow-cyan-400/20' : 'border-white/5 text-slate-500 hover:text-white hover:bg-white/5'}`}>{t.TEXT}</button>
                  <button onClick={() => setInputType('FILE')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all border ${inputType === 'FILE' ? 'bg-cyan-400 text-black border-cyan-400 shadow-lg shadow-cyan-400/20' : 'border-white/5 text-slate-500 hover:text-white hover:bg-white/5'}`}>{t.FILE}</button>
               </div>
               <div className="text-[10px] font-mono text-cyan-400/20 uppercase tracking-[0.4em] italic">Aegis_Vortex_Infil_Ready</div>
            </div>

            {inputType === 'TEXT' ? (
              <div className="space-y-4">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Insert raw tactical payload or ciphered buffer..."
                  className="w-full h-56 bg-black border border-white/10 rounded-3xl px-8 py-7 text-sm text-cyan-400 focus:border-cyan-400/50 outline-none transition-all mono resize-none shadow-inner leading-relaxed"
                />
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-56 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFiles.length > 0 ? 'bg-cyan-400/[0.03] border-cyan-400 shadow-[0_0_30px_rgba(0,242,255,0.05)]' : 'bg-black border-white/10 hover:border-cyan-400/50'}`}
              >
                <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <i className={`fas ${selectedFiles.length > 0 ? 'fa-file-shield' : 'fa-upload'} text-3xl mb-4 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,242,255,0.4)]`}></i>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60">{selectedFiles.length > 0 ? `${selectedFiles.length} ARTIFACTS STAGED` : 'DROP_TACTICAL_DATA_HERE'}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-4">
              <div className="md:col-span-8 space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2">{t.KEY}</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Authorization Phrase..." 
                  className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-sm text-cyan-400 focus:border-cyan-400/50 outline-none transition-all shadow-inner tracking-[0.6em]"
                />
              </div>
              <div className="md:col-span-4 flex gap-3 h-[62px]">
                <button 
                  onClick={() => handleProcess('encrypt')}
                  disabled={isProcessing}
                  className="flex-1 bg-cyan-400 text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <i className="fas fa-lock text-xs"></i> {t.SEAL}
                </button>
                <button 
                  onClick={() => handleProcess('decrypt')}
                  disabled={isProcessing}
                  className="flex-1 bg-white/5 border border-white/10 text-slate-400 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:border-cyan-400 hover:text-white disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <i className="fas fa-unlock text-xs"></i> {t.BREACH}
                </button>
              </div>
            </div>
          </div>

          {inputType === 'TEXT' && outputText && (
            <div className="glass-panel p-8 space-y-6 animate-in slide-in-from-top-4 duration-500 bg-white/[0.01]">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t.OUTPUT}</label>
                <button onClick={() => navigator.clipboard.writeText(outputText)} className="text-cyan-400 text-[10px] font-black uppercase hover:underline tracking-widest transition-all">Copy Result Buffer</button>
              </div>
              <div className="bg-black p-8 rounded-[2rem] border border-white/5 text-[12px] text-cyan-400/80 mono break-all leading-relaxed max-h-80 overflow-y-auto custom-scrollbar shadow-inner border-l-2 border-l-cyan-400/30">
                {outputText}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 space-y-6 border-cyan-400/20 bg-cyan-400/[0.02]">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] flex items-center gap-3 border-b border-cyan-400/10 pb-4">
               <i className="fas fa-microchip"></i> {t.ARCH_MASTER}
            </h3>
            <button 
              onClick={() => setMode(masterModeKey)}
              className={`w-full p-8 rounded-3xl border transition-all text-center flex flex-col items-center justify-center gap-4 relative overflow-hidden group ${mode === masterModeKey ? 'bg-cyan-400 border-cyan-400 text-black shadow-2xl shadow-cyan-400/30' : 'bg-black/60 border-white/10 text-slate-500 hover:text-white hover:border-white/30'}`}
            >
              <span className="text-sm font-black uppercase tracking-[0.3em] relative z-10">{MODES_METADATA[masterModeKey].name}</span>
              <span className="text-[9px] font-black opacity-60 tracking-widest relative z-10">8X_RECURSIVE_CRYPTO_ENCLAVE</span>
              {mode === masterModeKey && <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/0 via-white/20 to-cyan-400/0 animate-[shimmer_2s_infinite]"></div>}
            </button>
          </div>

          {chains.length > 0 && (
            <div className="glass-panel p-8 space-y-6 border-cyan-400/20 bg-cyan-400/[0.01]">
              <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] flex items-center gap-3 border-b border-cyan-400/10 pb-4">
                <i className="fas fa-link"></i> {t.ARCH_CUSTOM}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {chains.map(chain => (
                  <button 
                    key={chain.id}
                    onClick={() => setMode(chain.id)}
                    className={`px-4 py-5 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all text-center flex flex-col items-center justify-center gap-1 ${mode === chain.id ? 'bg-cyan-400 border-cyan-400 text-black shadow-xl shadow-cyan-400/20' : 'bg-black/60 border-white/5 text-slate-600 hover:text-white hover:border-white/20 hover:bg-white/5'}`}
                  >
                    <span>{chain.name}</span>
                    <span className="text-[7px] opacity-40">{chain.modes.length}_LAYERS</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel p-8 space-y-6">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/5 pb-4">
               <i className="fas fa-dna"></i> {t.ARCH_PRIMS}
            </h3>
            <div className="grid grid-cols-2 gap-3">
               {primitiveModes.map(([key, meta]) => (
                  <button 
                    key={key}
                    onClick={() => setMode(key as EncryptionMode)}
                    className={`px-4 py-5 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all text-center flex flex-col items-center justify-center gap-1 ${mode === key ? 'bg-cyan-400 border-cyan-400 text-black shadow-xl shadow-cyan-400/20' : 'bg-black/60 border-white/5 text-slate-600 hover:text-white hover:border-white/20 hover:bg-white/5'}`}
                  >
                    <span>{meta.name.split(' ')[0]}</span>
                    <span className="text-[7px] opacity-40 group-hover:opacity-100">{meta.name.split(' ').slice(1).join(' ')}</span>
                  </button>
               ))}
            </div>
          </div>

          <div className="glass-panel p-8 flex flex-col h-[380px] bg-black/40">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                   <i className="fas fa-satellite-dish text-cyan-400"></i> {t.LOGS}
                </h3>
             </div>
             <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-3">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale p-10 text-center">
                    <i className="fas fa-inbox text-4xl mb-4"></i>
                    <span className="text-[9px] font-black uppercase tracking-[0.5em]">No_Events_Logged</span>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className={`text-[9px] mono transition-all p-3 rounded-xl border-l-2 bg-white/[0.02] border-white/5 animate-in slide-in-from-right-2 ${log.type === 'success' ? 'text-cyan-400 border-l-cyan-400' : log.type === 'err' ? 'text-red-400 border-l-red-500' : 'text-slate-500 border-l-slate-800'}`}>
                      <span className="opacity-40 font-bold mr-2">[{log.timestamp}]</span> {log.msg}
                    </div>
                  ))
                )}
             </div>
             {activeLayer && (
               <div className="mt-6 p-4 bg-cyan-400 text-black rounded-2xl animate-pulse flex items-center justify-between shadow-2xl shadow-cyan-400/30">
                 <span className="text-[9px] font-black uppercase tracking-[0.4em]">PROCESSING_{MODES_METADATA[activeLayer].name}</span>
                 <i className="fas fa-sync-alt fa-spin text-sm"></i>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptionLab;
