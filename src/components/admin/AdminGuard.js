'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminHeader from './header';
import AdminFooter from './footer';
import Spinner from '../spinner';

export default function AdminGuard({ children, profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login' || pathname.startsWith('/login');
  const isAdmin = profile?.role === 'admin';
  const [checking, setChecking] = useState(!isLoginPage && !isAdmin);

  useEffect(() => {
    if (!isLoginPage && !isAdmin) {
      router.replace('/login');
    } else {
      setChecking(false);
    }
  }, [isLoginPage, isAdmin, router]);

  // 1. Jika di halaman login admin: jangan tampilkan navbar dan footer sama sekali
  if (isLoginPage) {
    return <main className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">{children}</main>;
  }

  // 2. Jika bukan login tapi belum terautentikasi sebagai admin: cegah bypass & redirect
  if (checking || !isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
        <Spinner text="Memeriksa izin akses administrator..." />
      </div>
    );
  }

  // 3. Jika sudah login sebagai admin: tampilkan navbar, konten, dan footer
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <AdminHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <AdminFooter />
    </div>
  );
}
