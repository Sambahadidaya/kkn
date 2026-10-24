'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Award, ShieldCheck, Home } from 'lucide-react';

export default function ProfileCard({ profile }) {
  const [qrUrl, setQrUrl] = useState('');

  const rumahId = profile?.rumah?.id;
  const statusPilah = profile?.rumah?.status_pilah_terakhir || 'belum';

  useEffect(() => {
    if (rumahId) {
      QRCode.toDataURL(rumahId, { width: 200, margin: 2 })
        .then(url => setQrUrl(url))
        .catch(err => console.error('Gagal generate QR rumah:', err));
    }
  }, [rumahId]);

  const statusBadges = {
    sudah: { label: 'Pilah Mandiri (+20 Poin)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    sebagian: { label: 'Sebagian Memilah (+10 Poin)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    belum: { label: 'Belum Memilah (0 Poin)', color: 'bg-rose-100 text-rose-800 border-rose-300' }
  };

  const badge = statusBadges[statusPilah] || statusBadges.belum;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs p-5 space-y-5 transition-colors">
      {/* Profil Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#d8f3dc] dark:bg-emerald-950 text-[#1b4332] dark:text-emerald-300 font-bold text-2xl flex items-center justify-center border border-[#b7e4c7] dark:border-emerald-800/60">
            {profile?.nama?.charAt(0).toUpperCase() || 'W'}
          </div>
          <div>
            <h3 className="font-bold text-stone-800 dark:text-stone-100 text-lg leading-tight">{profile?.nama}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">@{profile?.username} • {profile?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rincian Wilayah Rumah */}
      <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#f7faf8] dark:bg-stone-950/60 rounded-xl border border-stone-100 dark:border-stone-800 text-sm">
        <div>
          <span className="text-xs text-stone-600 dark:text-stone-400 block">Nomor Rumah</span>
          <span className="font-bold text-stone-800 dark:text-stone-200 text-base">{profile?.rumah?.nomor_rumah || '-'}</span>
        </div>
        <div>
          <span className="text-xs text-stone-600 dark:text-stone-400 block">Wilayah RT / RW</span>
          <span className="font-bold text-stone-800 dark:text-stone-200 text-base">
            RT {profile?.rt?.nomor || '-'} / RW {profile?.rw?.nomor || '-'}
          </span>
        </div>
      </div>

      {/* Kartu QR Rumah untuk Setor Sampah */}
      {qrUrl && (
        <div className="border border-stone-200 dark:border-stone-800 rounded-xl p-4 flex flex-col items-center text-center bg-white dark:bg-stone-900 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2d6a4f] dark:text-emerald-400 uppercase tracking-wider">
            <QrCode className="w-4 h-4" />
            <span>QR Code Rumah Anda</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs">
            Tunjukkan kode QR ini kepada petugas patroli saat menimbang sampah untuk pencatatan otomatis.
          </p>
          <div className="p-2 bg-white rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs">
            <img src={qrUrl} alt="QR Rumah" className="w-40 h-40" />
          </div>
          <span className="text-[10px] text-stone-600 dark:text-stone-400 font-mono select-all">
            ID: {rumahId}
          </span>
        </div>
      )}
    </div>
  );
}
