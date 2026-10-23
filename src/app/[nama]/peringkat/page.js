'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPeringkatAction } from '../../../api/supabase/public/profile';
import { getKategoriSampahAction } from '../../../api/supabase/public/tambah';
import SkeletonScreen from '../../../components/animasi/SkeletonScreen';
import { Trophy, Medal, Award, Filter, AlertTriangle } from 'lucide-react';

export default function PeringkatPage() {
  const params = useParams();
  const role = params?.nama?.toLowerCase();
  const isWarga = role === 'warga';

  const [leaderboard, setLeaderboard] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState('semua');
  const [loading, setLoading] = useState(true);

  // Default sorting: untuk warga cuman dari poinnya saja, untuk role lain default total kg
  const defaultSortBy = isWarga ? 'poin' : 'kg';
  const [sortBy, setSortBy] = useState(defaultSortBy);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pRes, kRes] = await Promise.all([
          getPeringkatAction({
            kategoriSlug: selectedKategori,
            sortBy: isWarga ? 'poin' : sortBy
          }),
          getKategoriSampahAction()
        ]);

        setLeaderboard(pRes.data || []);
        setKategoriList(kRes.kategori || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedKategori, sortBy, isWarga]);

  return (
    <div className="space-y-6">
      {/* Header Peringkat */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <span>Papan Peringkat Pemilahan</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          {isWarga
            ? 'Apresiasi warga teraktif mengumpulkan poin pemilahan sampah mandiri'
            : 'Peringkat tonase dan poin keaktifan warga berdasarkan kategori sampah'}
        </p>
      </div>

      {/* Filter Kategori Khusus Non-Warga Sesuai Feedback User */}
      {!isWarga && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Kategori Sampah (Default: Total Kg):</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => { setSelectedKategori('semua'); setSortBy('kg'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedKategori === 'semua'
                  ? 'bg-[#2d6a4f] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              Semua Kategori (Total Kg)
            </button>
            {kategoriList.map((k) => (
              <button
                key={k.id}
                onClick={() => setSelectedKategori(k.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  selectedKategori === k.slug
                    ? 'bg-[#2d6a4f] text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                {k.nama}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabel / Daftar Leaderboard */}
      {loading ? (
        <SkeletonScreen type="list" count={5} />
      ) : leaderboard.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500 text-sm">
          Belum ada data pada papan peringkat ini.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden divide-y divide-stone-100">
          {leaderboard.map((item, idx) => {
            const isTop1 = idx === 0;
            const isTop2 = idx === 1;
            const isTop3 = idx === 2;
            const isBelumMemilah = item.statusPilah === 'belum';

            return (
              <div
                key={item.wargaId || idx}
                className={`p-4 sm:p-5 flex items-center justify-between transition-colors ${
                  isTop1 ? 'bg-amber-50/50' : 'hover:bg-stone-50/80'
                }`}
              >
                {/* Ranking & Identitas */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 sm:w-10 flex items-center justify-center shrink-0">
                    {isTop1 ? (
                      <span className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center shadow-xs">
                        1
                      </span>
                    ) : isTop2 ? (
                      <span className="w-8 h-8 rounded-full bg-stone-300 text-stone-800 font-black text-sm flex items-center justify-center">
                        2
                      </span>
                    ) : isTop3 ? (
                      <span className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center">
                        3
                      </span>
                    ) : (
                      <span className="font-bold text-stone-400 text-sm">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                        {item.nama}
                      </h4>
                      {/* Penanda / Ciri Khusus untuk Warga yang Belum Memilah Sesuai Permintaan User */}
                      {isBelumMemilah && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Belum Memilah</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      RT {item.rtNomor || '-'} / RW {item.rwNomor || '-'}
                      {item.jumlahSetoran ? ` • ${item.jumlahSetoran}x setor` : ''}
                    </p>
                  </div>
                </div>

                {/* Nilai Peringkat */}
                <div className="text-right">
                  {isWarga ? (
                    <>
                      <span className="text-base sm:text-lg font-black text-[#2d6a4f] block">
                        {item.totalPoin} Poin
                      </span>
                      <span className="text-[11px] text-stone-400">Total Poin</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base sm:text-lg font-black text-[#2d6a4f] block">
                        {item.totalKg} Kg
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {item.totalPoin} Poin
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
