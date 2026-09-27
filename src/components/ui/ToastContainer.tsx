import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg"
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
