'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProfileDetailAction, updateProfilePengaturanAction } from '../../../../api/supabase/public/profile';
import ProfileCard from '../../../../components/public/profile';
import Notifikasi from '../../../../components/notifikasi';
import Spinner from '../../../../components/spinner';
import { User, Shield, BookOpen, FileText, Phone, Save } from 'lucide-react';

export default function PengaturanProfilPage() {
  const params = useParams();
  const role = params?.nama?.toLowerCase();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState(null);

  const [form, setForm] = useState({
    nama: '',
    noTelepon: ''
  });

  const loadProfile = async () => {
    try {
      const res = await getProfileDetailAction();
      if (res.success && res.profile) {
        setProfile(res.profile);
        setForm({
          nama: res.profile.nama || '',
          noTelepon: res.profile.no_telepon || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotif(null);
    try {
      const res = await updateProfilePengaturanAction(form);
      if (res.success) {
        setNotif({ tipe: 'sukses', pesan: res.message });
        loadProfile();
      } else {
        setNotif({ tipe: 'error', pesan: res.error });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const navLinks = [
    { label: 'Profil & QR', href: `/${role}/pengaturan/profil`, icon: User, active: true },
    { label: 'Keamanan Sandi', href: `/${role}/pengaturan/keamanan`, icon: Shield },
    { label: 'Panduan Warga', href: `/${role}/pengaturan/panduan`, icon: BookOpen },
    { label: 'Kebijakan Privasi', href: `/${role}/pengaturan/kebijakanPrivasi`, icon: FileText },
    { label: 'Kontak Pengurus', href: `/${role}/pengaturan/kontak`, icon: Phone }
  ];

  if (loading) {
    return <div className="p-8 text-center"><Spinner text="Memuat profil..." /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Pengaturan Akun</h2>
        <p className="text-xs sm:text-sm text-stone-500">Kelola identitas, QR code rumah, dan keamanan</p>
      </div>

      {/* Navigasi Sub-Tab Pengaturan */}
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

      {/* Kartu Profil & QR Code Rumah */}
      {profile?.role === 'warga' && (
        <ProfileCard profile={profile} />
      )}

      {/* Form Edit Data Kontak */}
      <form onSubmit={handleUpdate} className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
        <h3 className="font-bold text-stone-800 text-sm">Informasi Kontak</h3>

        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Nama Tampil</label>
          <input
            type="text"
            required
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Nomor Handphone</label>
          <input
            type="tel"
            required
            value={form.noTelepon}
            onChange={(e) => setForm({ ...form, noTelepon: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Email Terdaftar</label>
          <input
            type="email"
            disabled
            value={profile?.email || ''}
            className="w-full px-3.5 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-100 text-stone-500 cursor-not-allowed"
          />
          <span className="text-[11px] text-stone-400 mt-1 block">Alamat email dikunci untuk keamanan akun.</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {submitting ? <Spinner size="sm" /> : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
