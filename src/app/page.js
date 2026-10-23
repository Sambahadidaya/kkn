import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '../scurity/roleakses';
import { ArrowRight, BookOpen, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import SiteBackground from '../components/siteBackground';

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
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto">
      <SiteBackground />

      {/* Header Brand */}
      <div className="pt-8 text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-3xl shadow-lg mx-auto">
          ♻
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b4332] tracking-tight">
          KKN Tematik Lingkungan
        </h1>
        <p className="text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
          Sistem Digital Pemilahan & Pengelolaan Sampah Mandiri Tingkat RT/RW
        </p>
      </div>

      {/* Fitur Utama */}
      <div className="my-8 space-y-3.5">
        <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#1b4332] flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-800">Pilah Sampah & Raih Poin</h4>
            <p className="text-xs text-stone-500">Dapatkan +20 poin setiap kali Anda menyetor sampah terpilah</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-800">Edukasi & Asisten Pintar</h4>
            <p className="text-xs text-stone-500">Panduan lengkap jenis sampah organik, daur ulang, residu & B3</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-800">Keamanan Data Terenkripsi</h4>
            <p className="text-xs text-stone-500">KTP dan identitas Anda diamankan dengan enkripsi standar AES-256</p>
          </div>
        </div>
      </div>

      {/* Tombol Aksi Masuk / Daftar */}
      <div className="space-y-3 pb-6">
        <Link
          href="/login"
          className="w-full py-3.5 px-6 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base active:scale-98"
        >
          <span>Masuk ke Akun</span>
          <ArrowRight className="w-5 h-5" />
        </Link>

        <Link
          href="/register"
          className="w-full py-3.5 px-6 bg-white hover:bg-stone-50 text-stone-800 font-bold rounded-2xl border border-stone-300 shadow-2xs transition-all flex items-center justify-center gap-2 text-base active:scale-98"
        >
          <span>Daftar Warga Baru</span>
        </Link>

        <div className="text-center pt-2">
          <Link href="/admin/login" className="text-xs font-semibold text-stone-500 hover:text-[#2d6a4f]">
            Masuk sebagai Administrator / Aparatur →
          </Link>
        </div>
      </div>
    </div>
  );
}
