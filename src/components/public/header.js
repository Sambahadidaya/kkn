'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getRoleNav, ROLE_INFO } from '../../lib/roleData';
import ToggleTheme from '../toggleTheme';
import { LogOut } from 'lucide-react';
import { logoutAction } from '../../api/supabase/public/auth';

export default function Header({ role = 'warga', profile = null }) {
  const pathname = usePathname();
  const navList = getRoleNav(role);
  const info = ROLE_INFO[role] || { nama: 'Pengguna' };

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      await logoutAction();
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo dan Judul */}
        <div className="flex items-center gap-3">
          <Link href={`/${role}/beranda`} className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              ♻
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg text-[#1b4332] dark:text-emerald-400 leading-tight">
                KKN Sampah
              </h1>
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 bg-[#d8f3dc] dark:bg-emerald-950/70 border border-transparent dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
                {info.nama}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigasi Desktop (Hanya Muncul di Layar Lebar) */}
        <nav className="hidden md:flex items-center gap-1">
          {navList.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#eef8f2] dark:bg-emerald-950/60 text-[#2d6a4f] dark:text-emerald-300 font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Tombol Aksi Kanan: Bantuan Teks & Keluar */}
        <div className="flex items-center gap-2">
          <ToggleTheme />
          <button
            onClick={handleLogout}
            type="button"
            title="Keluar"
            className="p-2 text-stone-500 dark:text-stone-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
