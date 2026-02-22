
import React, { useState } from 'react';
import { User } from '../types';
import { API_BASE_URL } from '../config';

interface AuthPageProps {
  onLogin: (user: User) => void;
  lang: 'en' | 'ar';
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const endpoint = isLogin ? `${API_BASE_URL}/api/auth/login` : `${API_BASE_URL}/api/auth/register`;
      const payload = isLogin ? { email, password } : { email, password, username };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLogin(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Auth Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const t = {
    en: {
      LOGIN: 'IDENTITY_VERIFICATION',
      SIGNUP: 'OPERATOR_ENROLLMENT',
      EMAIL: 'UPLINK_EMAIL',
      PASS: 'ENTROPY_PHRASE',
      USER: 'CODENAME',
      SUBMIT_LOGIN: 'AUTHORIZE_ACCESS',
      SUBMIT_SIGNUP: 'INITIALIZE_PROFILE',
      TOGGLE_SIGNUP: 'Request New Credentials',
      TOGGLE_LOGIN: 'Return to Verification',
      FOOTER: 'AEGIS_PRISM | SECURE_TERMINAL_v9.2'
    },
    ar: {
      LOGIN: 'التحقق من الهوية',
      SIGNUP: 'تسجيل المشغل',
      EMAIL: 'بريد الربط',
      PASS: 'عبارة الإنتروبيا',
      USER: 'الاسم الرمزي',
      SUBMIT_LOGIN: 'تفويض الوصول',
      SUBMIT_SIGNUP: 'تهيئة الملف الشخصي',
      TOGGLE_SIGNUP: 'طلب بيانات اعتماد جديدة',
      TOGGLE_LOGIN: 'العودة إلى التحقق',
      FOOTER: 'إيجيس بريزم | محطة آمنة V9.2'
    }
  }[lang];

  return (
    <div className="min-h-screen w-full bg-[#000808] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full [background:repeating-linear-gradient(0deg,transparent,transparent_40px,rgba(0,242,255,0.05)_40px,rgba(0,242,255,0.05)_41px)]"></div>
        <div className="absolute top-0 left-0 w-full h-full [background:repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(0,242,255,0.05)_40px,rgba(0,242,255,0.05)_41px)]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-cyan-400 text-black shadow-[0_0_50px_rgba(0,242,255,0.3)] mb-6">
            <i className="fas fa-shield-cat text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            {isLogin ? t.LOGIN : t.SIGNUP}
          </h1>
          <p className="text-[10px] text-cyan-400/60 font-black uppercase tracking-[0.5em]">
            {t.FOOTER}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-10 space-y-8 bg-white/[0.01] border-white/10 shadow-2xl">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest animate-shake">
              <i className="fas fa-triangle-exclamation mr-2"></i> {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{t.USER}</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. GHOST_DAEMON"
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm text-cyan-400 focus:border-cyan-400/50 outline-none transition-all font-mono"
              />
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{t.EMAIL}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@aegis.prism"
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm text-cyan-400 focus:border-cyan-400/50 outline-none transition-all font-mono"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{t.PASS}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm text-cyan-400 focus:border-cyan-400/50 outline-none transition-all font-mono tracking-[0.3em]"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-5 bg-cyan-400 text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              isLogin ? t.SUBMIT_LOGIN : t.SUBMIT_SIGNUP
            )}
          </button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-cyan-400 transition-colors"
            >
              {isLogin ? t.TOGGLE_SIGNUP : t.TOGGLE_LOGIN}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
