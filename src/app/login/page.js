'use client';

import { useState } from 'react';
import Link from 'next/link';
import Switch from '../../components/switch';
import Notifikasi from '../../components/notifikasi';
import Spinner from '../../components/spinner';
import PasswordInput from '../../components/passwordInput';
import { loginAction } from '../../api/supabase/public/login';
import { Mail, User, Phone, LogIn } from 'lucide-react';
import SiteBackground from '../../components/siteBackground';
import ToggleTheme from '../../components/toggleTheme';
import { validateEmail, validatePhone, validatePassword } from '../../scurity/formatLimitKarak';

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

    // Validasi format sesuai mode input
    if (mode === 'email') {
      const emailCheck = validateEmail(identifier);
      if (!emailCheck.valid) {
        setErrorMsg(emailCheck.message);
        return;
      }
    } else if (mode === 'telepon') {
      const phoneCheck = validatePhone(identifier);
      if (!phoneCheck.valid) {
        setErrorMsg(phoneCheck.message);
        return;
      }
    } else if (mode === 'username') {
      if (!identifier.trim()) {
        setErrorMsg('Username wajib diisi.');
        return;
      }
    }

    // Validasi format kata sandi
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setErrorMsg(passwordCheck.message);
      return;
    }

    setLoading(true);

    try {
      const res = await loginAction({
        mode,
        identifier: identifier.trim(),
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
    if (mode === 'email') return 'Contoh: warga@domain.com';
    if (mode === 'username') return 'Contoh: budis01';
    return 'Contoh: 08123456789 atau +62812...';
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-4 sm:p-6 max-w-md mx-auto relative">
      <SiteBackground />

      {/* Floating Toggle Theme Pojok Kanan Atas */}
      <div className="absolute top-4 right-4 z-20">
        <ToggleTheme />
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xl p-6 sm:p-8 space-y-6 transition-colors">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
            ♻
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Masuk ke Akun</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">Pilih metode masuk yang paling mudah untuk Anda</p>
        </div>

        {errorMsg && <Notifikasi tipe="error" pesan={errorMsg} onClose={() => setErrorMsg('')} />}

        {/* Switch Pengganti Input Identitas Sesuai task1.md */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase">
            Metode Masuk
          </label>
          <Switch
            options={switchOptions}
            selected={mode}
            onChange={(val) => {
              setMode(val);
              setIdentifier('');
              setErrorMsg('');
            }}
          />
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1.5">
              {mode === 'email' ? 'Alamat Email' : mode === 'username' ? 'Nama Pengguna (Username)' : 'Nomor Handphone'}
            </label>
            <div className="relative">
              <input
                type={mode === 'email' ? 'email' : mode === 'telepon' ? 'tel' : 'text'}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden placeholder:text-stone-400 dark:placeholder:text-stone-500"
              />
              <div className="absolute left-3.5 top-3.5 text-stone-400 dark:text-stone-500">
                {mode === 'email' ? <Mail className="w-4 h-4" /> : mode === 'username' ? <User className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1.5">
              Kata Sandi
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 cursor-pointer"
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
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Belum punya akun warga?{' '}
            <Link href="/register" className="font-bold text-[#2d6a4f] dark:text-emerald-400 hover:underline">
              Daftar di sini
            </Link>
          </p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500">
            Petugas & Aparatur dapat masuk menggunakan email atau username yang telah didaftarkan.
          </p>
        </div>
      </div>
    </div>
  );
}
