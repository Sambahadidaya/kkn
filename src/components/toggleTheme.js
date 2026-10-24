'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ToggleTheme({ className = '', variant = 'icon' }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-800/80 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 shadow-xs backdrop-blur-md cursor-pointer ${
          isDark
            ? 'bg-stone-800/90 text-amber-300 border-stone-700 hover:bg-stone-750 hover:border-amber-400/40'
            : 'bg-white/90 text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-[#2d6a4f]/40'
        } ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span className="text-stone-200">Mode Terang</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-emerald-700" />
            <span className="text-stone-700">Mode Gelap</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      className={`relative p-2 rounded-xl border transition-all duration-200 shadow-xs backdrop-blur-md flex items-center justify-center cursor-pointer group active:scale-95 ${
        isDark
          ? 'bg-stone-800/90 text-amber-300 border-stone-700 hover:bg-stone-700 hover:border-amber-400/40 shadow-black/20'
          : 'bg-white/90 text-stone-700 border-stone-200 hover:bg-stone-50 hover:text-[#2d6a4f] hover:border-[#2d6a4f]/30'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4.5 h-4.5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-[#2d6a4f] transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
