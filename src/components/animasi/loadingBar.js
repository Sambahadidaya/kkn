'use client';

export default function LoadingBar({ progress = null, className = '' }) {
  return (
    <div className={`w-full bg-stone-200 rounded-full h-2 overflow-hidden ${className}`}>
      {progress !== null ? (
        <div
          className="bg-[#2d6a4f] h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      ) : (
        <div className="bg-[#2d6a4f] h-2 rounded-full w-1/2 animate-[indeterminate_1.5s_infinite_linear]" />
      )}
    </div>
  );
}
