'use client';

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Notifikasi({ tipe = 'info', pesan, onClose, className = '' }) {
  if (!pesan) return null;

  const styles = {
    sukses: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  const icons = {
    sukses: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
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
          className="ml-3 text-stone-400 hover:text-stone-700 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
