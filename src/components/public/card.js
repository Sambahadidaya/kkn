'use client';

export default function Card({ title, subtitle, children, footer, className = '', headerAction = null }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            {title && <h3 className="font-bold text-stone-800 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-[#f7faf8] border-t border-stone-100 text-xs text-stone-500">
          {footer}
        </div>
      )}
    </div>
  );
}
