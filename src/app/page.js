import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '../scurity/roleakses';
import { ArrowRight, BookOpen, ShieldCheck, Trophy } from 'lucide-react';
import SiteBackground from '../components/siteBackground';
import ToggleTheme from '../components/toggleTheme';

export default async function HomePage() {
  const profile = await getCurrentUserProfile();

  if (profile) {
    if (profile.role === 'admin') {
      redirect('/admin/dashboard');
    } else {
      redirect(`/${profile.role}/beranda`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto relative">
      <SiteBackground />

      {/* Floating Toggle Theme Pojok Kanan Atas */}
      <div className="absolute top-4 right-4 z-20">
        <ToggleTheme />
      </div>

      {/* Header Brand */}
      <div className="pt-8 text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-[#2d6a4f] dark:bg-emerald-600 text-white flex items-center justify-center font-bold text-3xl shadow-md mx-auto">
          ♻
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            KKN Tematik Lingkungan
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
            Sistem Digital Pemilahan & Pengelolaan Sampah Mandiri Tingkat RT/RW
          </p>
        </div>
      </div>

      {/* Fitur Utama - Warna Disederhanakan & Konsisten Serasi */}
      <div className="my-8 space-y-3">
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#2d6a4f] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">Pilah Sampah & Raih Poin</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">Dapatkan poin setiap kali Anda menyetor sampah terpilah</p>
          </div>
        </div>

        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#2d6a4f] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">Edukasi & Asisten Pintar</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">Panduan lengkap jenis sampah organik, daur ulang, residu & B3</p>
          </div>
        </div>

        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#2d6a4f] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">Keamanan Data Terenkripsi</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">KTP dan identitas Anda diamankan dengan enkripsi standar AES-256</p>
          </div>
        </div>
      </div>

      {/* Tombol Aksi Masuk / Daftar */}
      <div className="space-y-3 pb-6">
        <Link
          href="/login"
          className="w-full py-3.5 px-6 bg-[#2d6a4f] hover:bg-[#1b4332] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base active:scale-98 cursor-pointer"
        >
          <span>Masuk ke Akun</span>
          <ArrowRight className="w-5 h-5" />
        </Link>

        <Link
          href="/register"
          className="w-full py-3.5 px-6 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs transition-all flex items-center justify-center gap-2 text-base active:scale-98 cursor-pointer"
        >
          <span>Daftar Warga Baru</span>
        </Link>

      </div>
    </div>
  );
}
