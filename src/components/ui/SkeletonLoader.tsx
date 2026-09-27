import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
          <div className="space-y-1.5">
            <div className="w-28 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
        <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
        <div className="w-3/4 h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
      </div>
    </div>
  );
};
