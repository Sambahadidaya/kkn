'use client';

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Notifikasi({ tipe = 'info', pesan, onClose, className = '' }) {
  if (!pesan) return null;

  const styles = {
    sukses: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60',
    error: 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/60',
    info: 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800/60'
  };

  const icons = {
    sukses: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
  };

  return (
    <div
      className={`flex items-start justify-between p-4 rounded-xl border ${styles[tipe] || styles.info} ${className}`}
    >
      <div className="flex items-start gap-3">
        {icons[tipe] || icons.info}
        <p className="text-sm font-medium leading-relaxed">{pesan}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="ml-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
