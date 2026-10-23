'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getBerandaDataAction } from '../../../api/supabase/public/beranda';
import Card from '../../../components/public/card';
import SkeletonScreen from '../../../components/animasi/SkeletonScreen';
import {
  Trophy,
  Calendar,
  Clock,
  PlusCircle,
  Users,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function BerandaPage() {
  const params = useParams();
  const role = params?.nama?.toLowerCase();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getBerandaDataAction();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [role]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonScreen count={3} />
      </div>
    );
  }

  // ==================== TAMPILAN BERANDA WARGA ====================
  if (role === 'warga') {
    const statusBadges = {
      sudah: { label: 'Memilah Lengkap', poin: '+20 Poin', color: 'bg-emerald-100 text-emerald-800' },
      sebagian: { label: 'Sebagian Memilah', poin: '+10 Poin', color: 'bg-amber-100 text-amber-800' },
      belum: { label: 'Belum Memilah', poin: '0 Poin', color: 'bg-rose-100 text-rose-800' }
    };

    const badge = statusBadges[data?.statusPilah] || statusBadges.belum;

    return (
      <div className="space-y-5">
        {/* Banner Dashboard Native Android Style Sesuai task1.md */}
        <div className="bg-[#2d6a4f] text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
              Capaian Pemilahan Sampah Anda
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black">{data?.totalPoin || 0}</span>
              <span className="text-emerald-200 font-bold text-sm">Poin Terkumpul</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.color}`}>
                Status: {badge.label} ({badge.poin})
              </span>
              <span className="text-xs text-emerald-100 font-medium">
                Total Setoran: {data?.totalKg || 0} Kg
              </span>
            </div>
          </div>
        </div>

        {/* Jadwal Terdekat */}
        <Card
          title="Jadwal Patroli Pengambilan Berikutnya"
          subtitle="Pastikan sampah sudah dipilah di depan rumah"
          headerAction={
            <Link href="/warga/jadwal" className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1">
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {data?.jadwalTerdekat ? (
            <div className="p-4 bg-[#f7faf8] rounded-2xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl border border-stone-200 flex flex-col items-center justify-center text-[#2d6a4f]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {data.jadwalTerdekat.tanggal}
                  </h4>
                  <p className="text-xs text-stone-500">
                    Pukul {data.jadwalTerdekat.jam_mulai?.slice(0, 5)} WIB • Petugas: {data.jadwalTerdekat.petugas?.nama || 'Petugas Lingkungan'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {data.jadwalTerdekat.status}
              </span>
            </div>
          ) : (
            <p className="text-xs text-stone-500 py-2">Belum ada jadwal patroli terdekat untuk RT Anda.</p>
          )}
        </Card>

        {/* Menu Aksi Cepat */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/warga/edukasi"
            className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-[#2d6a4f] transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-800">Katalog Sampah</h4>
              <p className="text-[11px] text-stone-500">Pelajari jenis sampah</p>
            </div>
          </Link>

          <Link
            href="/warga/peringkat"
            className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-[#2d6a4f] transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-800">Peringkat Warga</h4>
              <p className="text-[11px] text-stone-500">Cek poin tertinggi</p>
            </div>
          </Link>
        </div>

        {/* Riwayat Setoran Terakhir */}
        <Card
          title="Riwayat Timbangan Terakhir"
          headerAction={
            <Link href="/warga/riwayat" className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1">
              <span>Selengkapnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {data?.riwayatSingkat?.length === 0 ? (
            <p className="text-xs text-stone-500 py-2">Belum ada riwayat setoran sampah.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {data?.riwayatSingkat?.map((rw, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-800 block text-sm">{rw.tanggal}</span>
                    <span className="text-stone-500">Poin: +{rw.poin} • Status: {rw.status_pilah}</span>
                  </div>
                  <div className="text-right font-bold text-[#2d6a4f]">
                    {rw.setoran_item?.reduce((a, b) => a + Number(b.berat_kg || 0), 0).toFixed(2)} Kg
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ==================== TAMPILAN BERANDA PETUGAS ====================
  if (role === 'petugas') {
    return (
      <div className="space-y-5">
        <div className="bg-[#2d6a4f] text-white p-6 rounded-3xl shadow-md space-y-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
            Panel Kerja Petugas Patroli
          </span>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-black">{data?.totalDicatat || 0}</span>
              <p className="text-xs text-emerald-100">Total Setoran Dicatat</p>
            </div>
            <Link
              href="/petugas/tambah"
              className="py-3 px-5 bg-white text-[#2d6a4f] font-bold rounded-2xl shadow-md hover:bg-stone-100 transition-colors flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Catat Sampah Baru</span>
            </Link>
          </div>
        </div>

        {/* Jadwal Patroli Hari Ini */}
        <Card title="Jadwal Patroli Hari Ini">
          {data?.jadwalHariIni?.length === 0 ? (
            <div className="text-center py-6 text-stone-500 text-xs">
              Tidak ada jadwal patroli tercatat untuk hari ini.
            </div>
          ) : (
            <div className="space-y-3">
              {data?.jadwalHariIni?.map((j) => (
                <div key={j.id} className="p-4 bg-[#f7faf8] rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900 text-sm">
                      Jam: {j.jam_mulai?.slice(0, 5)} WIB
                    </div>
                    <div className="text-xs text-stone-600 mt-1">
                      Target Wilayah: {j.rts?.map(r => `RT ${r.rt?.nomor}/RW ${r.rt?.rw?.nomor}`).join(', ') || '-'}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {j.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ==================== TAMPILAN BERANDA RT ====================
  if (role === 'rt') {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-semibold block">Total Warga RT</span>
            <span className="text-2xl font-bold text-stone-900">{data?.jumlahWarga || 0}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-semibold block">Total Sampah RT</span>
            <span className="text-2xl font-bold text-[#2d6a4f]">{data?.totalKg || 0} Kg</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-xs text-stone-500 font-semibold block">Warga Aktif Memilah</span>
            <span className="text-2xl font-bold text-emerald-700">{data?.wargaSudahPilah || 0}</span>
          </div>
        </div>

        {/* 5 Warga Teratas */}
        <Card
          title="Warga dengan Poin Tertinggi di RT Ini"
          headerAction={
            <Link href="/rt/data" className="text-xs font-bold text-[#2d6a4f] hover:underline">
              Kelola Data Lengkap →
            </Link>
          }
        >
          <div className="divide-y divide-stone-100 text-sm">
            {data?.topWarga?.map((w, idx) => (
              <div key={w.warga_id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-stone-400">#{idx + 1}</span>
                  <div>
                    <span className="font-bold text-stone-800 block">{w.nama_tampil}</span>
                    <span className="text-xs text-stone-500">Status: {w.status_pilah_terakhir || 'belum'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#2d6a4f] block">{w.total_poin} Poin</span>
                  <span className="text-xs text-stone-400">{w.total_kg} Kg</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // ==================== TAMPILAN BERANDA RW & KELURAHAN ====================
  return (
    <div className="space-y-5">
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-stone-900 text-lg">
          Rekapitulasi Lingkungan {role.toUpperCase()}
        </h3>
        <p className="text-xs text-stone-500">
          Ringkasan agregat capaian partisipasi pilah sampah per wilayah
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7faf8] uppercase font-bold text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-3">Wilayah</th>
                <th className="p-3 text-center">Jumlah Warga</th>
                <th className="p-3 text-right">Total Sampah (Kg)</th>
                <th className="p-3 text-right">Total Poin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data?.rekapRt?.map((r, i) => (
                <tr key={i} className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-800">RT {r.rt_nomor} / RW {r.rw_nomor}</td>
                  <td className="p-3 text-center">{r.jumlah_warga}</td>
                  <td className="p-3 text-right font-semibold text-[#2d6a4f]">{r.total_kg} Kg</td>
                  <td className="p-3 text-right font-bold">{r.total_poin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
