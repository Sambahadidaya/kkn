'use client';

import { useState, useEffect } from 'react';
import { loginAction } from '../../../api/supabase/public/login';
import { getCurrentUserAction } from '../../../api/supabase/public/auth';
import Notifikasi from '../../../components/notifikasi';
import Spinner from '../../../components/spinner';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import ToggleTheme from '../../../components/toggleTheme';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getCurrentUserAction().then(res => {
      if (res?.success && res?.user?.role === 'admin') {
        window.location.href = '/admin/dashboard';
      }
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginAction({
        mode: 'email',
        identifier: email,
        password
      });

      if (res.success) {
        if (res.role !== 'admin') {
          setErrorMsg('Akun Anda bukan administrator. Silakan login di halaman warga/petugas.');
        } else {
          window.location.href = '/admin/dashboard';
        }
      } else {
        setErrorMsg(res.error || 'Gagal masuk sebagai admin.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative">
      {/* Floating Toggle Theme Pojok Kanan Atas */}
      <div className="absolute top-4 right-4 z-20">
        <ToggleTheme />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl p-8 space-y-6 transition-colors">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#2d6a4f] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Masuk Administrator</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">Panel khusus pengelola sistem dan aparatur kelurahan</p>
        </div>

        {errorMsg && <Notifikasi tipe="error" pesan={errorMsg} onClose={() => setErrorMsg('')} />}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1.5">
              Email Administrator
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden placeholder:text-stone-400 dark:placeholder:text-stone-500"
              />
              <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden placeholder:text-stone-400 dark:placeholder:text-stone-500"
              />
              <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Spinner size="sm" /> : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="text-center pt-2">
          <a href="/login" className="text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-[#2d6a4f] dark:hover:text-emerald-400">
            ← Kembali ke Login Warga & Petugas
          </a>
        </div>
      </div>
    </div>
  );
}
