'use client';

export default function AdminCard({ title, value, icon, change = null, description = null, className = '' }) {
  return (
    <div className={`bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2 transition-colors ${className}`}>
      <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-700 dark:text-stone-300">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</div>
      {(change || description) && (
        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 pt-1">
          {change && <span className="font-semibold text-emerald-600 dark:text-emerald-400">{change}</span>}
          {description && <span>{description}</span>}
        </div>
      )}
    </div>
  );
}
