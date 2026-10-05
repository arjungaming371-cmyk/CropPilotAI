import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Tractor,
  Sparkles,
  ClipboardList,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Farms & Crops', to: '/farms', icon: Tractor },
  { name: 'AI Crop Diagnostic', to: '/advisor/new', icon: Sparkles, highlight: true },
  { name: 'Advisory History', to: '/history', icon: ClipboardList },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-stone-200 hidden md:flex flex-col justify-between p-4 shrink-0">
      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                } ${item.highlight ? 'border border-emerald-200/60 bg-emerald-50/40' : ''}`
              }
            >
              <Icon className={`w-5 h-5 ${item.highlight ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-stone-100 space-y-2">
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
          <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold mb-1">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Field Agronomy Tip</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Ensure leaf samples are dry and taken in daylight before diagnostic inspection for maximum accuracy.
          </p>
        </div>
      </div>
    </aside>
  );
}
