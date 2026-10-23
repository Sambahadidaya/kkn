'use client';

import { useState, useEffect } from 'react';
import AdminCard from '../../../components/admin/card';
import Grafik from '../../../components/admin/grafik';
import SkeletonScreen from '../../../components/animasi/SkeletonScreen';
import { Users, Trash2, Award, Activity } from 'lucide-react';
import { getStatistikTrafikAction } from '../../../api/supabase/admin/trafik';
import { getDaftarAkunAction } from '../../../api/supabase/admin/auth';
import { getPeringkatAction } from '../../../api/supabase/public/profile';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAkun: 0,
    totalKg: 0,
    wargaPilah: 0,
    totalKunjungan: 0,
    trafikPerRole: {}
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [akunRes, rankRes, trafikRes] = await Promise.all([
          getDaftarAkunAction(),
          getPeringkatAction({ sortBy: 'kg' }),
          getStatistikTrafikAction()
        ]);

        const akunList = akunRes.data || [];
        const rankList = rankRes.data || [];
        const totalKg = rankList.reduce((acc, r) => acc + (r.totalKg || 0), 0);
        const wargaPilah = rankList.filter(r => r.statusPilah === 'sudah').length;

        setStats({
          totalAkun: akunList.length,
          totalKg: Number(totalKg.toFixed(2)),
          wargaPilah,
          totalKunjungan: trafikRes.totalKunjungan || 0,
          trafikPerRole: trafikRes.perRole || {}
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonScreen count={4} />
        </div>
      </div>
    );
  }

  const roleChartData = Object.entries(stats.trafikPerRole).map(([r, count]) => ({
    label: r.toUpperCase(),
    value: count
  }));

  return (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Dashboard Utama</h2>
        <p className="text-sm text-stone-500">Ringkasan operasional dan partisipasi pengolahan sampah</p>
      </div>

      {/* Grid Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard
          title="Total Pengguna"
          value={stats.totalAkun}
          icon={<Users className="w-5 h-5 text-[#2d6a4f]" />}
          description="Terdaftar di sistem"
        />
        <AdminCard
          title="Total Sampah Terkumpul"
          value={`${stats.totalKg} Kg`}
          icon={<Trash2 className="w-5 h-5 text-blue-600" />}
          description="Seluruh RT & RW"
        />
        <AdminCard
          title="Warga Sudah Memilah"
          value={stats.wargaPilah}
          icon={<Award className="w-5 h-5 text-emerald-600" />}
          change="+20 Poin"
          description="Mandiri dari rumah"
        />
        <AdminCard
          title="Aktivitas Kunjungan"
          value={stats.totalKunjungan}
          icon={<Activity className="w-5 h-5 text-amber-600" />}
          description="Hitung akses sistem"
        />
      </div>

      {/* Grafik Aktivitas Pengguna Berdasarkan Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Grafik
          title="Distribusi Aktivitas Berdasarkan Role Pengguna"
          data={roleChartData.length > 0 ? roleChartData : [
            { label: 'WARGA', value: 12 },
            { label: 'PETUGAS', value: 8 },
            { label: 'RT', value: 5 },
            { label: 'RW', value: 3 }
          ]}
          xKey="label"
          yKey="value"
        />

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <h4 className="font-bold text-stone-800 text-sm">Petunjuk Pengelolaan Administrator</h4>
          <ul className="text-xs text-stone-600 space-y-3 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#2d6a4f] font-bold">1.</span>
              <span><strong>Kelola Akun:</strong> Tambahkan akun baru untuk Petugas Pengambil, Ketua RT, Ketua RW, dan Kelurahan pada menu Akun.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2d6a4f] font-bold">2.</span>
              <span><strong>Konfigurasi AI:</strong> Sesuaikan model OpenAI (misal gpt-4o-mini) dan instruksi system prompt asisten pada menu AI.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2d6a4f] font-bold">3.</span>
              <span><strong>Privasi KTP:</strong> Seluruh data NIK dan KTP warga terenkripsi otomatis di database dengan standar AES-256-GCM.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
