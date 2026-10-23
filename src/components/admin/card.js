'use client';

export default function AdminCard({ title, value, icon, change = null, description = null, className = '' }) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-stone-500">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 bg-stone-100 rounded-xl text-stone-700">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-stone-900">{value}</div>
      {(change || description) && (
        <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
          {change && <span className="font-semibold text-emerald-600">{change}</span>}
          {description && <span>{description}</span>}
        </div>
      )}
    </div>
  );
}
