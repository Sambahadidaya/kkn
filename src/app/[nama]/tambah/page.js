'use client';

import { useState, useEffect, useRef } from 'react';
import { cariRumahAction, resolveQrRumahAction } from '../../../api/supabase/public/scan';
import { getKategoriSampahAction, simpanSetoranSampahAction } from '../../../api/supabase/public/tambah';
import Notifikasi from '../../../components/notifikasi';
import Spinner from '../../../components/spinner';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Scale,
  PlusCircle,
  Home,
  User,
  Camera,
  X
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function TambahSampahPage() {
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pencarian Rumah
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Scanner QR
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef(null);

  // Rumah yang Dipilih
  const [selectedRumah, setSelectedRumah] = useState(null);

  // Form Timbangan
  const [statusPilah, setStatusPilah] = useState('sudah'); // 'sudah' | 'sebagian' | 'belum'
  const [weights, setWeights] = useState({}); // { [kategoriId]: berat_kg }
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await getKategoriSampahAction();
        setKategoriList(res.kategori || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Mulai Pemindaian QR Kamera Menggunakan html5-qrcode
  useEffect(() => {
    let html5QrCode = null;

    if (scannerOpen) {
      html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCode
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            // Berhasil scan QR (berisi UUID rumah.id)
            html5QrCode.stop().then(() => setScannerOpen(false));
            handleResolveQr(decodedText);
          },
          () => {}
        )
        .catch(err => {
          console.error('Gagal start kamera QR:', err);
          alert('Tidak dapat menyalakan scanner: ' + err);
          setScannerOpen(false);
        });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [scannerOpen]);

  const handleResolveQr = async (rumahId) => {
    setSearching(true);
    setNotif(null);
    try {
      const res = await resolveQrRumahAction(rumahId);
      if (res.success && res.rumah) {
        setSelectedRumah(res.rumah);
        setNotif({ tipe: 'sukses', pesan: `QR Terdeteksi: Rumah ${res.rumah.nomor_rumah} (${res.rumah.nama})` });
      } else {
        setNotif({ tipe: 'error', pesan: res.error || 'QR rumah tidak valid.' });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    } finally {
      setSearching(false);
    }
  };

  const handleSearchRumah = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setNotif(null);
    try {
      const res = await cariRumahAction(searchQuery);
      if (res.success) {
        setSearchResults(res.results || []);
        if (res.results.length === 0) {
          setNotif({ tipe: 'warning', pesan: 'Rumah/warga tidak ditemukan dengan kata kunci tersebut.' });
        }
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    } finally {
      setSearching(false);
    }
  };

  const handlePilihRumah = (rmh) => {
    setSelectedRumah(rmh);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleWeightChange = (katId, val) => {
    setWeights(prev => ({
      ...prev,
      [katId]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRumah) {
      setNotif({ tipe: 'error', pesan: 'Pilih rumah warga terlebih dahulu.' });
      return;
    }

    // Buat array items
    const items = Object.entries(weights)
      .filter(([_, val]) => Number(val) > 0)
      .map(([kategori_id, berat_kg]) => ({
        kategori_id,
        berat_kg: Number(berat_kg)
      }));

    if (items.length === 0) {
      setNotif({ tipe: 'error', pesan: 'Masukkan minimal satu timbangan berat sampah (> 0 Kg).' });
      return;
    }

    setSubmitting(true);
    setNotif(null);

    try {
      const res = await simpanSetoranSampahAction({
        rumahId: selectedRumah.rumah_id,
        wargaId: selectedRumah.warga_id,
        statusPilah,
        catatan,
        items
      });

      if (res.success) {
        setNotif({ tipe: 'sukses', pesan: res.message });
        setSelectedRumah(null);
        setWeights({});
        setCatatan('');
        setStatusPilah('sudah');
      } else {
        setNotif({ tipe: 'error', pesan: res.error || 'Gagal menyimpan setoran.' });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Scale className="w-6 h-6 text-[#2d6a4f]" />
          <span>Pencatatan Sampah Petugas</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          Cari rumah warga atau scan QR code rumah untuk mencatat timbangan
        </p>
      </div>

      {notif && <Notifikasi tipe={notif.tipe} pesan={notif.pesan} onClose={() => setNotif(null)} />}

      {/* LANGKAH 1: IDENTIFIKASI RUMAH WARGA */}
      {!selectedRumah ? (
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm">Langkah 1: Tentukan Rumah Warga</h3>

          {/* Tombol Buka Kamera Scanner QR */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="w-full py-3.5 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-2xl shadow-xs flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span>Pindai QR Code Rumah Warga</span>
          </button>

          {/* Area Modal Scanner QR */}
          {scannerOpen && (
            <div className="p-4 bg-stone-900 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-white text-xs">
                <span className="font-bold">Arahkan kamera ke QR Rumah</span>
                <button
                  type="button"
                  onClick={() => setScannerOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div id="qr-reader" className="w-full rounded-xl overflow-hidden bg-black" />
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-stone-200"></div>
            <span className="shrink mx-3 text-xs text-stone-400 font-semibold">ATAU CARI MANUAL</span>
            <div className="grow border-t border-stone-200"></div>
          </div>

          {/* Form Pencarian Nama / Nomor Rumah */}
          <form onSubmit={handleSearchRumah} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama warga atau nomor rumah..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-xl"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl disabled:opacity-50"
            >
              {searching ? <Spinner size="sm" /> : 'Cari'}
            </button>
          </form>

          {/* Hasil Pencarian */}
          {searchResults.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-100 max-h-60 overflow-y-auto">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Pilih Rumah yang Cocok:</span>
              {searchResults.map((r) => (
                <div
                  key={r.rumah_id}
                  onClick={() => handlePilihRumah(r)}
                  className="p-3 bg-[#f7faf8] hover:bg-[#eef8f2] border border-stone-200 hover:border-[#2d6a4f] rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{r.nama || 'Tanpa Nama'}</h4>
                    <p className="text-xs text-stone-500">
                      Rumah: <strong>{r.nomor_rumah}</strong> • RT {r.rt_nomor}/RW {r.rw_nomor}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#2d6a4f]">Pilih →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* RUMAH TERPILIH */
        <div className="p-4 bg-[#eef8f2] rounded-2xl border border-[#b7e4c7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center font-bold">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-emerald-800 font-semibold block">Rumah Terpilih:</span>
              <h4 className="font-bold text-stone-900 text-sm">
                {selectedRumah.nama || 'Warga'} — No. {selectedRumah.nomor_rumah}
              </h4>
              <p className="text-[11px] text-stone-500">
                RT {selectedRumah.rt_nomor} / RW {selectedRumah.rw_nomor}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRumah(null)}
            className="text-xs font-bold text-rose-700 bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-2xs hover:bg-rose-50"
          >
            Ganti Rumah
          </button>
        </div>
      )}

      {/* LANGKAH 2: FORM TIMBANGAN & STATUS PILAH */}
      {selectedRumah && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-5">
          <h3 className="font-bold text-stone-900 text-sm">Langkah 2: Status Pemilahan & Berat Sampah</h3>

          {/* Opsi Poin Pemilahan Sesuai Spesifikasi Task1.md & Feedback */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
              Status Pemilahan Sampah oleh Warga:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                onClick={() => setStatusPilah('sudah')}
                className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col items-center text-center gap-1 ${
                  statusPilah === 'sudah'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                <span className="text-emerald-700 font-extrabold text-sm">+20 Poin</span>
                <span>Pilah Mandiri</span>
                <span className="text-[10px] text-stone-500 font-normal">Dipisah rapi dari rumah</span>
              </label>

              <label
                onClick={() => setStatusPilah('sebagian')}
                className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col items-center text-center gap-1 ${
                  statusPilah === 'sebagian'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                <span className="text-amber-700 font-extrabold text-sm">+10 Poin</span>
                <span>Sebagian Pilah</span>
                <span className="text-[10px] text-stone-500 font-normal">Hanya sebagian dipisah</span>
              </label>

              <label
                onClick={() => setStatusPilah('belum')}
                className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col items-center text-center gap-1 ${
                  statusPilah === 'belum'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                <span className="text-rose-700 font-extrabold text-sm">0 Poin</span>
                <span>Belum Memilah</span>
                <span className="text-[10px] text-stone-500 font-normal">Tercampur (Beri tanda)</span>
              </label>
            </div>
          </div>

          {/* Input Berat Sampah per Kategori */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
              Berat Sampah per Kategori (Kg):
            </label>
            <div className="grid grid-cols-2 gap-3">
              {kategoriList.map((kat) => (
                <div key={kat.id} className="p-3 bg-[#f7faf8] rounded-xl border border-stone-200 space-y-1">
                  <label className="block text-xs font-bold text-stone-800 truncate">
                    {kat.nama}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={weights[kat.id] || ''}
                      onChange={(e) => handleWeightChange(kat.id, e.target.value)}
                      placeholder="0.00"
                      className="w-full pr-8 pl-3 py-2 text-sm bg-white border border-stone-300 rounded-lg font-bold"
                    />
                    <span className="absolute right-2.5 top-2 text-xs font-semibold text-stone-400">Kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Catatan Petugas (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Dus tebal 3 ikat, botol bersih"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {submitting ? <Spinner size="sm" /> : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Simpan Timbangan & Berikan Poin</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
