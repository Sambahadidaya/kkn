'use client';

import { usePathname } from 'next/navigation';

export default function AdminFooter() {
  const pathname = usePathname();

  // Jangan tampilkan footer jika di halaman login
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-stone-200 py-4 px-6 text-center text-xs text-stone-500 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>&copy; 2026 Admin KKN Tematik Pengolahan Sampah Lingkungan</span>
        <span>Aman • Terenkripsi AES-256-GCM • Supabase SSR</span>
      </div>
    </footer>
  );
}
