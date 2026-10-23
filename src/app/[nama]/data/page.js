'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getDataRoleAction, ajukanAksesDataAction, prosesPermintaanAksesAction } from '../../../api/supabase/public/data';
import Card from '../../../components/public/card';
import Modal from '../../../components/modal';
import Notifikasi from '../../../components/notifikasi';
import Spinner from '../../../components/spinner';
import SkeletonScreen from '../../../components/animasi/SkeletonScreen';
import {
  Users,
  ShieldCheck,
  CreditCard,
  Building,
  Building2,
  Lock,
  Unlock,
  Check,
  X,
  ExternalLink,
  Search
} from 'lucide-react';

export default function DataPage() {
  const params = useParams();
  const role = params?.nama?.toLowerCase();

  const [loading, setLoading] = useState(true);
  const [dataResult, setDataResult] = useState(null);
  const [notif, setNotif] = useState(null);

  // RT Search & KTP Detail Modal
  const [search, setSearch] = useState('');
  const [selectedKtp, setSelectedKtp] = useState(null);

  // Warga Request State
  const [alasanRequest, setAlasanRequest] = useState('');
  const [requesting, setRequesting] = useState(false);

  const loadData = async () => {
    try {
      const res = await getDataRoleAction();
      if (res.success) {
        setDataResult(res);
      } else {
        setNotif({ tipe: 'error', pesan: res.error });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleAjukanAkses = async (e) => {
    e.preventDefault();
    setRequesting(true);
    setNotif(null);
    try {
      const res = await ajukanAksesDataAction(alasanRequest);
      if (res.success) {
        setNotif({ tipe: 'sukses', pesan: res.message });
        setAlasanRequest('');
        loadData();
      } else {
        setNotif({ tipe: 'error', pesan: res.error });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    } finally {
      setRequesting(false);
    }
  };

  const handleProsesAkses = async (requestId, status) => {
    try {
      const res = await prosesPermintaanAksesAction({ requestId, status });
      if (res.success) {
        setNotif({ tipe: 'sukses', pesan: res.message });
        loadData();
      } else {
        setNotif({ tipe: 'error', pesan: res.error });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonScreen count={3} />
      </div>
    );
  }

  // ==================== 1. TAMPILAN ROLE RT: DATA WARGA LENGKAP & KTP ====================
  if (role === 'rt' || role === 'admin') {
    const wargaList = (dataResult?.data || []).filter(w =>
      w.nama?.toLowerCase().includes(search.toLowerCase()) ||
      w.nomorRumah?.toLowerCase().includes(search.toLowerCase()) ||
      w.ktp?.nik?.includes(search)
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#2d6a4f]" />
              <span>Data Warga RT Lengkap</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Hak akses RT: data lengkap warga, alamat, kontak, dan verifikasi KTP
            </p>
          </div>
          {/* Header Jumlah Sesuai task1.md */}
          <div className="bg-[#2d6a4f] text-white px-4 py-2 rounded-2xl flex items-center gap-2 self-start sm:self-auto shadow-xs">
            <span className="text-xs font-semibold uppercase">Total Warga RT:</span>
            <span className="text-lg font-black">{dataResult?.totalWarga || 0}</span>
          </div>
        </div>

        {notif && <Notifikasi tipe={notif.tipe} pesan={notif.pesan} onClose={() => setNotif(null)} />}

        {/* Pencarian Warga */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
          <Search className="w-5 h-5 text-stone-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama warga, nomor rumah, atau NIK..."
            className="flex-1 text-sm bg-transparent border-none outline-hidden"
          />
        </div>

        {/* Tabel Data Warga RT */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-[#f7faf8] text-xs uppercase font-semibold text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5">Nama & Rumah</th>
                  <th className="px-5 py-3.5">Kontak</th>
                  <th className="px-5 py-3.5">Status Pilah</th>
                  <th className="px-5 py-3.5 text-center">Poin / Kg</th>
                  <th className="px-5 py-3.5 text-right">Data KTP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {wargaList.map((w) => (
                  <tr key={w.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-stone-900">{w.nama}</div>
                      <div className="text-xs text-stone-500">Rumah No. {w.nomorRumah}</div>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div>{w.noTelepon || '-'}</div>
                      <div className="text-stone-400">{w.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        w.statusPilah === 'sudah' ? 'bg-emerald-100 text-emerald-800' :
                        w.statusPilah === 'sebagian' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {w.statusPilah}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-[#2d6a4f] block">{w.totalPoin} Poin</span>
                      <span className="text-[11px] text-stone-400">{w.totalKg} Kg</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {w.ktp ? (
                        <button
                          type="button"
                          onClick={() => setSelectedKtp(w)}
                          className="px-3 py-1.5 bg-[#eef8f2] hover:bg-[#d8f3dc] text-[#1b4332] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Lihat KTP</span>
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Belum KTP</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Detail KTP Terdekripsi */}
        {selectedKtp && (
          <Modal
            isOpen={Boolean(selectedKtp)}
            onClose={() => setSelectedKtp(null)}
            title={`Detail KTP: ${selectedKtp.nama}`}
          >
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-[#eef8f2] text-[#1b4332] rounded-xl border border-[#b7e4c7] font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Data terenkripsi AES-256-GCM telah didekripsi aman untuk RT.</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl">
                <div>
                  <span className="text-stone-500 text-[11px] block">NIK KTP</span>
                  <strong className="text-stone-900 font-mono text-sm">{selectedKtp.ktp?.nik || '-'}</strong>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] block">Nama pada KTP</span>
                  <strong className="text-stone-900">{selectedKtp.ktp?.namaKtp || '-'}</strong>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-500 text-[11px] block">Alamat KTP</span>
                <p className="text-stone-800 font-medium">{selectedKtp.ktp?.alamat || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl">
                <div>
                  <span className="text-stone-500 text-[11px] block">Tanggal Lahir</span>
                  <span className="text-stone-800 font-medium">{selectedKtp.ktp?.tanggalLahir || '-'}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] block">Pekerjaan</span>
                  <span className="text-stone-800 font-medium">{selectedKtp.ktp?.pekerjaan || '-'}</span>
                </div>
              </div>

              {selectedKtp.fotoKtpUrl && (
                <div>
                  <span className="text-stone-500 text-[11px] block mb-1 font-bold">Mentahan Foto KTP:</span>
                  <div className="rounded-xl overflow-hidden border border-stone-200">
                    <img src={selectedKtp.fotoKtpUrl} alt="Foto KTP" className="w-full max-h-56 object-contain bg-black" />
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ==================== 2. TAMPILAN ROLE RW: HANYA JUMLAH TOTAL RT ====================
  if (role === 'rw') {
    const rekapList = dataResult?.data || [];
    const totalWargaRw = rekapList.reduce((acc, r) => acc + Number(r.jumlah_warga || 0), 0);
    const totalKgRw = rekapList.reduce((acc, r) => acc + Number(r.total_kg || 0), 0);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#2d6a4f]" />
            <span>Rekapitulasi Data RT (Tingkat RW)</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Hak akses RW: jumlah agregat dan tonase sampah per RT tanpa detail identitas KTP
          </p>
        </div>

        {/* Ringkasan Header RW */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 uppercase font-semibold">Total Warga di RW Ini</span>
            <div className="text-3xl font-extrabold text-stone-900 mt-1">{totalWargaRw} Orang</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 uppercase font-semibold">Total Sampah Terkumpul</span>
            <div className="text-3xl font-extrabold text-[#2d6a4f] mt-1">{totalKgRw.toFixed(2)} Kg</div>
          </div>
        </div>

        {/* Tabel Rekap RT */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 font-bold text-sm text-stone-800">
            Daftar Jumlah RT di Bawah Wilayah RW
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7faf8] text-xs uppercase font-semibold text-stone-600 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4">Nomor RT</th>
                <th className="px-6 py-4 text-center">Jumlah Warga</th>
                <th className="px-6 py-4 text-right">Total Sampah (Kg)</th>
                <th className="px-6 py-4 text-right">Total Poin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rekapList.map((rt) => (
                <tr key={rt.rt_id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 font-bold text-stone-900">RT {rt.rt_nomor}</td>
                  <td className="px-6 py-4 text-center font-semibold">{rt.jumlah_warga}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#2d6a4f]">{rt.total_kg} Kg</td>
                  <td className="px-6 py-4 text-right font-semibold">{rt.total_poin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==================== 3. TAMPILAN ROLE KELURAHAN: HANYA JUMLAH TOTAL RT & RW ====================
  if (role === 'kelurahan') {
    const rekapRwList = dataResult?.rekapRw || [];
    const rekapRtList = dataResult?.rekapRt || [];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-[#2d6a4f]" />
            <span>Rekapitulasi Agregat Kelurahan</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Hak akses Kelurahan: statistik total jumlah RT dan RW tanpa data personal
          </p>
        </div>

        {/* Tabel Rekap RW */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 font-bold text-sm text-stone-800">
            Rekap Jumlah per RW
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7faf8] text-xs uppercase font-semibold text-stone-600 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4">Nomor RW</th>
                <th className="px-6 py-4 text-center">Jumlah RT</th>
                <th className="px-6 py-4 text-center">Jumlah Warga</th>
                <th className="px-6 py-4 text-right">Total Sampah (Kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rekapRwList.map((rw) => (
                <tr key={rw.rw_id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 font-bold text-stone-900">RW {rw.rw_nomor}</td>
                  <td className="px-6 py-4 text-center">{rw.jumlah_rt} RT</td>
                  <td className="px-6 py-4 text-center font-semibold">{rw.jumlah_warga}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#2d6a4f]">{rw.total_kg} Kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==================== 4. TAMPILAN ROLE WARGA: PERMINTAAN AKSES DATA KTP ====================
  const { hasActiveApproval, requests = [], myKtp, fotoKtpUrl } = dataResult || {};

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#2d6a4f]" />
          <span>Privasi & Akses Data KTP Anda</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          Data KTP Anda dienkripsi aman. Untuk membuka dekripsi data, ajukan permohonan ke pengurus RT/RW
        </p>
      </div>

      {notif && <Notifikasi tipe={notif.tipe} pesan={notif.pesan} onClose={() => setNotif(null)} />}

      {/* Jika Akses Sudah Disetujui */}
      {hasActiveApproval && myKtp ? (
        <div className="bg-white p-6 rounded-3xl border border-emerald-300 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <Unlock className="w-5 h-5 text-emerald-600" />
            <span>Akses Dekripsi KTP Sedang Aktif</span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-[#eef8f2] rounded-xl text-xs sm:text-sm">
            <div>
              <span className="text-stone-500 text-[11px] block">NIK</span>
              <strong className="font-mono">{myKtp.nik}</strong>
            </div>
            <div>
              <span className="text-stone-500 text-[11px] block">Nama KTP</span>
              <strong>{myKtp.namaKtp}</strong>
            </div>
          </div>

          <div className="p-3 bg-[#eef8f2] rounded-xl text-xs sm:text-sm">
            <span className="text-stone-500 text-[11px] block">Alamat</span>
            <p>{myKtp.alamat}</p>
          </div>

          {fotoKtpUrl && (
            <div>
              <span className="text-xs font-bold text-stone-600 block mb-1">Foto KTP:</span>
              <img src={fotoKtpUrl} alt="KTP Saya" className="w-full max-h-52 object-contain bg-black rounded-xl" />
            </div>
          )}
        </div>
      ) : (
        /* Form Pengajuan Izin Akses */
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-800 rounded-2xl shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Data KTP Terkunci Aman</h3>
              <p className="text-xs text-stone-500 leading-relaxed mt-0.5">
                Sesuai protokol keamanan KKN, melihat dekripsi mentah KTP memerlukan persetujuan dari RT, RW, atau Kelurahan Anda.
              </p>
            </div>
          </div>

          <form onSubmit={handleAjukanAkses} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Alasan Permintaan Melihat Data KTP:
              </label>
              <textarea
                required
                rows={3}
                value={alasanRequest}
                onChange={(e) => setAlasanRequest(e.target.value)}
                placeholder="Contoh: Ingin memverifikasi kebenaran nomor NIK dan alamat domisili..."
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={requesting}
              className="w-full py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {requesting ? <Spinner size="sm" /> : 'Ajukan Izin Buka KTP'}
            </button>
          </form>

          {/* Riwayat Permintaan Sebelumnya */}
          {requests.length > 0 && (
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <span className="text-xs font-bold text-stone-600 block uppercase">Status Pengajuan Terakhir:</span>
              {requests.map((r) => (
                <div key={r.id} className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-800 block">{r.alasan}</span>
                    <span className="text-[11px] text-stone-400">{new Date(r.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    r.status === 'disetujui' ? 'bg-emerald-100 text-emerald-800' :
                    r.status === 'ditolak' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
