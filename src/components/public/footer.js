'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getRoleNav } from '../../lib/roleData';
import {
  Home,
  BookOpen,
  Calendar,
  Clock,
  Trophy,
  PlusCircle,
  Users,
  Building,
  Building2,
  Settings
} from 'lucide-react';

const ICON_MAP = {
  Home,
  BookOpen,
  Calendar,
  Clock,
  Trophy,
  PlusCircle,
  Users,
  Building,
  Building2,
  Settings
};

export default function Footer({ role = 'warga' }) {
  const pathname = usePathname();
  const navList = getRoleNav(role);

  return (
    <>
      {/* 1. MOBILE BOTTOM BAR (Utama First-Mobile Sesuai Task1.md) */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-2 py-1 shadow-lg flex items-center justify-around transition-colors"
      >
        {navList.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const IconComp = ICON_MAP[item.icon] || Home;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 flex-1 ${
                isActive
                  ? 'text-[#2d6a4f] dark:text-emerald-400 font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-[#d8f3dc] dark:bg-emerald-950/80 text-[#2d6a4f] dark:text-emerald-300' : 'bg-transparent'
                }`}
              >
                <IconComp className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 leading-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 2. FOOTER INFORMASI SITUS (Tampil di bagian bawah halaman) */}
      <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 mt-12 py-8 px-4 text-center text-sm text-stone-500 dark:text-stone-400 pb-24 md:pb-8 transition-colors">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#2d6a4f] dark:text-emerald-400 font-bold text-base">
            <span>♻</span>
            <span>KKN Tematik Pengolahan Sampah Lingkungan</span>
          </div>
          <p className="max-w-md mx-auto text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Inisiatif digital untuk membantu masyarakat dalam memilah, menimbang, dan mendaur ulang sampah rumah tangga demi kelestarian lingkungan RT & RW.
          </p>
          <div className="flex justify-center gap-4 pt-2 text-stone-400 dark:text-stone-500 text-lg">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram" className="hover:text-[#2d6a4f] dark:hover:text-emerald-400">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook" className="hover:text-[#2d6a4f] dark:hover:text-emerald-400">
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" title="YouTube" className="hover:text-[#2d6a4f] dark:hover:text-emerald-400">
              <i className="fa-brands fa-youtube"></i>
            </a>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 pt-2">
            &copy; 2026 KKN Tematik Lingkungan Bersih. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </>
  );
}
