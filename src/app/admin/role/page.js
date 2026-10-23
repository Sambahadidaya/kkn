'use client';

import { Shield, Check, Minus } from 'lucide-react';
import { ROLE_INFO } from '../../../lib/roleData';

export default function AdminRolePage() {
  const permissions = [
    {
      feature: 'Lihat Jadwal Patroli Sampah',
      roles: { warga: true, petugas: true, rt: true, rw: true, kelurahan: true, admin: true }
    },
    {
      feature: 'Buat & Kelola Jadwal Patroli',
      roles: { warga: false, petugas: true, rt: false, rw: false, kelurahan: false, admin: true }
    },
    {
      feature: 'Catat Timbangan Sampah & Beri Poin',
      roles: { warga: false, petugas: true, rt: false, rw: false, kelurahan: false, admin: true }
    },
    {
      feature: 'Lihat Riwayat Sampah Sendiri',
      roles: { warga: true, petugas: true, rt: true, rw: false, kelurahan: false, admin: true }
    },
    {
      feature: 'Lihat Data Lengkap & KTP Warga RT',
      roles: { warga: false, petugas: false, rt: true, rw: false, kelurahan: false, admin: true }
    },
    {
      feature: 'Lihat Rekap Agregat RT (Jumlah Saja)',
      roles: { warga: false, petugas: false, rt: false, rw: true, kelurahan: true, admin: true }
    },
    {
      feature: 'Setujui Permintaan Akses Data KTP',
      roles: { warga: false, petugas: false, rt: true, rw: true, kelurahan: true, admin: true }
    },
    {
      feature: 'Papan Peringkat / Leaderboard Poin',
      roles: { warga: true, petugas: true, rt: true, rw: true, kelurahan: true, admin: true }
    },
    {
      feature: 'Kelola Akun Aparatur & Konfigurasi AI',
      roles: { warga: false, petugas: false, rt: false, rw: false, kelurahan: false, admin: true }
    }
  ];

  const roleKeys = ['warga', 'petugas', 'rt', 'rw', 'kelurahan', 'admin'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Matriks Hak Akses & Role</h2>
        <p className="text-sm text-stone-500">Struktur perizinan data dan fitur berdasarkan regulasi privasi</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7faf8] text-xs font-semibold text-stone-600 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4">Fitur / Hak Akses</th>
                {roleKeys.map(r => (
                  <th key={r} className="px-4 py-4 text-center uppercase">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-stone-50">
                  <td className="px-6 py-4 font-medium text-stone-800">{p.feature}</td>
                  {roleKeys.map(r => {
                    const allowed = p.roles[r];
                    return (
                      <td key={r} className="px-4 py-4 text-center">
                        {allowed ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-100 text-stone-400">
                            <Minus className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
