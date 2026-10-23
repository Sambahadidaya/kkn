'use client';

export default function Switch({ options = [], selected, onChange, className = '' }) {
  return (
    <div className={`flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 ${className}`}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 ${
              isSelected
                ? 'bg-white text-[#2d6a4f] shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
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
