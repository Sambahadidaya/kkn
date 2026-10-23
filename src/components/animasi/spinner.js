'use client';

export default function Spinner({ size = 'md', text = null, className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-[#d8f3dc] border-t-[#2d6a4f] animate-spin`}
      />
      {text && <span className="text-sm font-medium text-stone-600">{text}</span>}
    </div>
  );
}
