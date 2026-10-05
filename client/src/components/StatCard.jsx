import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-stone-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.emerald}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
