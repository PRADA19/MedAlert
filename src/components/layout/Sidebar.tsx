import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Calendar,
  History,
  BarChart3,
  Settings,
  PlusCircle,
  Activity,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/medicines', label: 'Medicines', icon: Pill },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/history', label: 'History', icon: History },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
          <Activity className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
            MediAlert <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">Pro</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">Smart Medicine Reminder</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                twMerge(
                  clsx(
                    'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 dark:bg-brand-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  )
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Quick Add Callout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-2">
          <div className="mx-auto w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Never miss a dose
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            MediAlert runs in real-time to protect your health schedule.
          </p>
        </div>
      </div>
    </aside>
  );
};
