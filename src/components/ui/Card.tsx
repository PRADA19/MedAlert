import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverEffect = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm transition-all duration-200',
          hoverEffect && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
