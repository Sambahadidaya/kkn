'use client';

import { useState, useEffect } from 'react';
import { getRiwayatSampahAction } from '../../../api/supabase/public/riwayat';
import SkeletonScreen from '../../../components/animasi/SkeletonScreen';
import { Clock, Calendar, Scale, Award, Home, User } from 'lucide-react';

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getRiwayatSampahAction({ page: 1, limit: 30 });
        if (res.success) {
          setRiwayat(res.data || []);
          setTotal(res.total || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const statusBadges = {
    sudah: { label: 'Memilah Lengkap', color: 'bg-emerald-100 text-emerald-800' },
    sebagian: { label: 'Sebagian Memilah', color: 'bg-amber-100 text-amber-800' },
    belum: { label: 'Belum Memilah', color: 'bg-rose-100 text-rose-800' }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#2d6a4f]" />
          <span>Riwayat Setoran Sampah</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          Catatan penimbangan, berat sampah, dan poin penghargaan pemilahan
        </p>
      </div>

      {loading ? (
        <SkeletonScreen type="list" count={4} />
      ) : riwayat.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500 text-sm">
          Belum ada catatan riwayat setoran sampah.
        </div>
      ) : (
        <div className="space-y-3">
          {riwayat.map((item) => {
            const badge = statusBadges[item.status_pilah] || statusBadges.belum;
            const totalKg = (item.items || []).reduce((acc, it) => acc + Number(it.berat_kg || 0), 0);

            return (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3"
              >
                {/* Header Baris */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#eef8f2] text-[#2d6a4f] flex items-center justify-center font-bold">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">
                        {item.warga?.nama || 'Warga'} — No. Rumah: {item.rumah?.nomor_rumah || '-'}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {item.tanggal} • Petugas: {item.petugas?.nama || 'Petugas Patroli'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-[#2d6a4f] block">
                      {totalKg.toFixed(2)} Kg
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      +{item.poin} Poin
                    </span>
                  </div>
                </div>

                {/* Status Badge & Catatan */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badge.color}`}>
                    {badge.label}
                  </span>
                  {item.catatan && (
                    <span className="text-xs text-stone-500 italic">
                      Catatan: "{item.catatan}"
                    </span>
                  )}
                </div>

                {/* Rincian Item Sampah per Kategori */}
                {item.items?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-100 text-xs">
                    {item.items.map((it, idx) => (
                      <div key={idx} className="bg-[#f7faf8] p-2 rounded-lg border border-stone-100">
                        <span className="text-stone-500 block truncate">{it.kategori?.nama}</span>
                        <span className="font-bold text-stone-800">{it.berat_kg} Kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
