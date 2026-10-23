'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { updateProfilePengaturanAction } from '../../../../api/supabase/public/profile';
import Notifikasi from '../../../../components/notifikasi';
import Spinner from '../../../../components/spinner';
import { Lock, Shield, User, BookOpen, FileText, Phone, KeyRound } from 'lucide-react';

export default function PengaturanKeamananPage() {
  const params = useParams();
  const role = params?.nama?.toLowerCase();

  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState(null);

  const navLinks = [
    { label: 'Profil & QR', href: `/${role}/pengaturan/profil`, icon: User },
    { label: 'Keamanan Sandi', href: `/${role}/pengaturan/keamanan`, icon: Shield, active: true },
    { label: 'Panduan Warga', href: `/${role}/pengaturan/panduan`, icon: BookOpen },
    { label: 'Kebijakan Privasi', href: `/${role}/pengaturan/kebijakanPrivasi`, icon: FileText },
    { label: 'Kontak Pengurus', href: `/${role}/pengaturan/kontak`, icon: Phone }
  ];

  const handleGantiPassword = async (e) => {
    e.preventDefault();
    if (passwordBaru.length < 6) {
      setNotif({ tipe: 'error', pesan: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }
    if (passwordBaru !== konfirmasi) {
      setNotif({ tipe: 'error', pesan: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    setLoading(true);
    setNotif(null);

    try {
      const res = await updateProfilePengaturanAction({ passwordBaru });
      if (res.success) {
        setNotif({ tipe: 'sukses', pesan: 'Kata sandi berhasil diganti!' });
        setPasswordBaru('');
        setKonfirmasi('');
      } else {
        setNotif({ tipe: 'error', pesan: res.error });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Keamanan Akun</h2>
        <p className="text-xs sm:text-sm text-stone-500">Perbarui kata sandi untuk melindungi akun Anda</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {navLinks.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <a
              key={idx}
              href={item.href}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
                item.active
                  ? 'bg-[#2d6a4f] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>

      {notif && <Notifikasi tipe={notif.tipe} pesan={notif.pesan} onClose={() => setNotif(null)} />}

      <form onSubmit={handleGantiPassword} className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
        <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#2d6a4f]" />
          <span>Ganti Kata Sandi</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
            Kata Sandi Baru
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
            Ulangi Kata Sandi Baru
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={konfirmasi}
            onChange={(e) => setKonfirmasi(e.target.value)}
            placeholder="Masukkan ulang kata sandi baru"
            className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? <Spinner size="sm" /> : 'Simpan Kata Sandi Baru'}
        </button>
      </form>
    </div>
  );
}
