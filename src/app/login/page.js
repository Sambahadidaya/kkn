'use client';

import { useState } from 'react';
import Link from 'next/link';
import Switch from '../../components/switch';
import Notifikasi from '../../components/notifikasi';
import Spinner from '../../components/spinner';
import { loginAction } from '../../api/supabase/public/login';
import { Mail, User, Phone, Lock, LogIn } from 'lucide-react';
import SiteBackground from '../../components/siteBackground';

export default function LoginPage() {
  const [mode, setMode] = useState('email'); // 'email' | 'username' | 'telepon'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const switchOptions = [
    { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { value: 'username', label: 'Username', icon: <User className="w-4 h-4" /> },
    { value: 'telepon', label: 'No. HP', icon: <Phone className="w-4 h-4" /> }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginAction({
        mode,
        identifier,
        password
      });

      if (res.success) {
        window.location.href = res.redirectTo;
      } else {
        setErrorMsg(res.error || 'Identitas atau kata sandi tidak sesuai.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    if (mode === 'email') return 'Contoh: warga@email.com';
    if (mode === 'username') return 'Contoh: budis01';
    return 'Contoh: 08123456789';
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-4 sm:p-6 max-w-md mx-auto">
      <SiteBackground />

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
            ♻
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Masuk ke Akun</h2>
          <p className="text-xs text-stone-500">Pilih metode masuk yang paling mudah untuk Anda</p>
        </div>

        {errorMsg && <Notifikasi tipe="error" pesan={errorMsg} onClose={() => setErrorMsg('')} />}

        {/* Switch Pengganti Input Identitas Sesuai task1.md */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-stone-600 uppercase">
            Metode Masuk
          </label>
          <Switch
            options={switchOptions}
            selected={mode}
            onChange={(val) => {
              setMode(val);
              setIdentifier('');
            }}
          />
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1.5">
              {mode === 'email' ? 'Alamat Email' : mode === 'username' ? 'Nama Pengguna (Username)' : 'Nomor Handphone'}
            </label>
            <div className="relative">
              <input
                type={mode === 'email' ? 'email' : mode === 'telepon' ? 'tel' : 'text'}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full pl-10 pr-4 py-3 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f] focus:outline-hidden"
              />
              <div className="absolute left-3.5 top-3.5 text-stone-400">
                {mode === 'email' ? <Mail className="w-4 h-4" /> : mode === 'username' ? <User className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full pl-10 pr-4 py-3 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f] focus:outline-hidden"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {loading ? <Spinner size="sm" /> : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 space-y-2">
          <p className="text-xs text-stone-500">
            Belum punya akun warga?{' '}
            <Link href="/register" className="font-bold text-[#2d6a4f] hover:underline">
              Daftar di sini
            </Link>
          </p>
          <p className="text-[11px] text-stone-400">
            Petugas & Aparatur dapat masuk menggunakan email atau username yang telah didaftarkan.
          </p>
        </div>
      </div>
    </div>
  );
}
