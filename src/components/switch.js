'use client';

export default function Switch({ options = [], selected, onChange, className = '' }) {
  return (
    <div className={`flex items-center p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700/80 ${className}`}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
              isSelected
                ? 'bg-white dark:bg-stone-900 text-[#2d6a4f] dark:text-emerald-400 shadow-xs border border-stone-200 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
