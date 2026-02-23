
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { Host } from '../types';

interface NetworkVisualizerProps {
  hosts: Host[];
  lang: 'en' | 'ar';
}

const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ hosts, lang }) => {
  if (hosts.length === 0) return null;

  // OS Breakdown
  const osData = hosts.reduce((acc: any[], host) => {
    const existing = acc.find(item => item.name === host.os);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: host.os, value: 1 });
    }
    return acc;
  }, []);

  // Port Distribution
  const portCounts: Record<number, number> = {};
  hosts.forEach(host => {
    host.ports.forEach(p => {
      portCounts[p.port] = (portCounts[p.port] || 0) + 1;
    });
  });
  const portData = Object.entries(portCounts)
    .map(([port, count]) => ({ port: `Port ${port}`, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Risk Scores
  const riskData = hosts.map(h => ({ name: h.hostname || h.ip, risk: h.riskScore }));

  const COLORS = ['#00f2ff', '#00d2ff', '#00b2ff', '#0092ff', '#0072ff', '#0052ff'];

  const t = {
    en: {
      OS: 'OS_BREAKDOWN',
      PORTS: 'TOP_PORTS_DISTRIBUTION',
      RISK: 'NODE_RISK_PROFILES',
      COUNT: 'HOST_COUNT'
    },
    ar: {
      OS: 'توزيع_نظام_التشغيل',
      PORTS: 'توزيع_المنافذ_الأكثر_استخداماً',
      RISK: 'ملفات_مخاطر_العقد',
      COUNT: 'عدد_المضيفين'
    }
  }[lang];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-700">
      <div className="flex items-center gap-4 px-8 py-4 bg-cyan-400/5 border border-cyan-400/20 rounded-2xl w-fit">
        <i className="fas fa-network-wired text-cyan-400"></i>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.COUNT}:</span>
        <span className="text-xl font-black text-white italic">{hosts.length}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* OS Pie Chart */}
      <div className="glass-panel p-8 bg-white/[0.01] border-white/5 space-y-6">
        <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] border-b border-white/5 pb-4">{t.OS}</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={osData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {osData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#00f2ff' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Port Bar Chart */}
      <div className="glass-panel p-8 bg-white/[0.01] border-white/5 space-y-6">
        <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] border-b border-white/5 pb-4">{t.PORTS}</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={portData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="port" type="category" stroke="#64748b" fontSize={10} width={60} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,242,255,0.05)' }}
                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
              />
              <Bar dataKey="count" fill="#00f2ff" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Area Chart */}
      <div className="glass-panel p-8 bg-white/[0.01] border-white/5 space-y-6 lg:col-span-2 xl:col-span-1">
        <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] border-b border-white/5 pb-4">{t.RISK}</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskData}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
              />
              <Area type="monotone" dataKey="risk" stroke="#00f2ff" fillOpacity={1} fill="url(#colorRisk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>
    </div>
  );
};

export default NetworkVisualizer;
