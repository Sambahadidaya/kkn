'use client';

import { useEffect, useState } from 'react';

export default function Grafik({ data = [], title = 'Statistik Setoran Sampah', xKey = 'label', yKey = 'value' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-48 bg-stone-100 dark:bg-stone-800 rounded-xl animate-pulse" />;

  const maxValue = Math.max(...data.map(d => Number(d[yKey]) || 0), 10);

  return (
    <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">{title}</h4>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400 py-6 text-center">Belum ada data grafik.</p>
      ) : (
        <div className="flex items-end gap-2 h-40 pt-6">
          {data.map((item, idx) => {
            const val = Number(item[yKey]) || 0;
            const heightPercent = Math.min(100, Math.max(8, (val / maxValue) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 opacity-80 group-hover:opacity-100">
                  {val}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[36px] bg-[#2d6a4f] hover:bg-[#1b4332] dark:bg-emerald-500 dark:hover:bg-emerald-400 rounded-t-md transition-all duration-300"
                />
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate max-w-full text-center">
                  {item[xKey]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
