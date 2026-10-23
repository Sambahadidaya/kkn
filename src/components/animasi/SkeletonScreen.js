'use client';

export default function SkeletonScreen({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-stone-200 animate-pulse space-y-3">
            <div className="h-5 bg-stone-200 rounded w-1/3" />
            <div className="h-4 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="divide-y divide-stone-100 bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {items.map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-stone-200 rounded w-28" />
                <div className="h-3 bg-stone-200 rounded w-20" />
              </div>
            </div>
            <div className="h-6 bg-stone-200 rounded w-14" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-32 bg-stone-200 rounded-2xl animate-pulse" />
  );
}
