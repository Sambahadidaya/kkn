'use client';

export default function Card({ title, subtitle, children, footer, className = '', headerAction = null }) {
  return (
    <div className={`bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs overflow-hidden transition-colors ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            {title && <h3 className="font-bold text-stone-800 dark:text-stone-100 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5 text-stone-800 dark:text-stone-200">{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-[#f7faf8] dark:bg-stone-950/50 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
          {footer}
        </div>
      )}
    </div>
  );
}
