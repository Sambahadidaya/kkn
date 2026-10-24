'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROLE_INFO } from '../../lib/roleData';
import { LogOut } from 'lucide-react';
import { logoutAction } from '../../api/supabase/public/auth';
import ToggleTheme from '../toggleTheme';

export default function AdminHeader() {
  const pathname = usePathname();

  // Jangan tampilkan header jika di halaman login
  if (pathname === '/login' || pathname.startsWith('/login')) {
    return null;
  }

  const navList = ROLE_INFO.admin.navigasi;

  const handleLogout = async () => {
    if (confirm('Keluar dari panel admin?')) {
      await logoutAction();
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              ⚙
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900 dark:text-stone-100 leading-tight">Admin KKN Sampah</h2>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Panel Pengelola Aparatur</span>
            </div>
          </Link>
        </div>

        {/* Menu Navigasi Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navList.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive
                    ? 'bg-[#2d6a4f] text-white shadow-2xs font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ToggleTheme />
          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
