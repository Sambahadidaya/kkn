'use client';

// Komponen penyesuai kontras atau ukuran teks ramah usia 40+
import { useState, useEffect } from 'react';
import { Type } from 'lucide-react';

export default function ToggleTheme() {
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    if (largeText) {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }
  }, [largeText]);

  return (
    <button
      onClick={() => setLargeText(!largeText)}
      title="Ubah Ukuran Teks (Ramah Mata)"
      type="button"
      className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
    >
      <Type className="w-4 h-4 text-[#2d6a4f]" />
      <span>{largeText ? 'Teks Normal' : 'Teks Besar'}</span>
    </button>
  );
}
