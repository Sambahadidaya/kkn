'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getDaftarWilayahAction, registrasiWargaAction } from '../../api/supabase/public/registrasi';
import { scanKtpAction } from '../../api/openai/scanktp';
import Notifikasi from '../../components/notifikasi';
import Spinner from '../../components/spinner';
import SiteBackground from '../../components/siteBackground';
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  RefreshCw,
  CreditCard,
  User,
  Mail,
  Phone,
  Lock,
  Home
} from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1 = Data Akun, 2 = KTP & Wilayah
  const [wilayah, setWilayah] = useState({ rw: [], rt: [] });
  const [loadingWilayah, setLoadingWilayah] = useState(true);

  // Data Tahap 1
  const [step1, setStep1] = useState({
    namaUser: '',
    emailUser: '',
    noTelepon: '',
    username: '',
    password: ''
  });

  // Data Tahap 2 (KTP & Wilayah)
  const [fotoKtp, setFotoKtp] = useState(null); // base64
  const [scanningKtp, setScanningKtp] = useState(false);
  const [ktpData, setKtpData] = useState({
    nik: '',
    namaKtp: '',
    alamatKtp: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: 'LAKI-LAKI',
    pekerjaan: '',
    detailKtp: '',
    rwId: '',
    rtId: '',
    nomorRumah: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState(null);

  // Video / Camera Stream
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    async function fetchWilayah() {
      try {
        const res = await getDaftarWilayahAction();
        setWilayah({ rw: res.rw || [], rt: res.rt || [] });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingWilayah(false);
      }
    }
    fetchWilayah();
  }, []);

  // Nyalakan Kamera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      alert('Tidak dapat mengakses kamera: ' + err.message + '. Anda dapat memilih opsi upload file foto.');
    }
  };

  // Matikan Kamera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Ambil Foto dari Kamera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    processKtpPhoto(dataUrl);
  };

  // Upload Foto dari File Picker
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      processKtpPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Proses Foto dengan AI OCR (OpenAI Vision)
  const processKtpPhoto = async (dataUrl) => {
    setFotoKtp(dataUrl);
    setScanningKtp(true);
    setNotif(null);

    try {
      const res = await scanKtpAction(dataUrl);
      if (res.success && res.data) {
        const d = res.data;
        setKtpData(prev => ({
          ...prev,
          nik: d.nik || prev.nik,
          namaKtp: d.nama || d.nama_lengkap || step1.namaUser,
          alamatKtp: d.alamat || prev.alamatKtp,
          tempatLahir: d.tempat_lahir || prev.tempatLahir,
          tanggalLahir: d.tanggal_lahir || prev.tanggalLahir,
          jenisKelamin: d.jenis_kelamin?.toUpperCase().includes('PEREMPUAN') ? 'PEREMPUAN' : 'LAKI-LAKI',
          pekerjaan: d.pekerjaan || prev.pekerjaan,
          detailKtp: JSON.stringify(d)
        }));
        setNotif({ tipe: 'sukses', pesan: 'AI berhasil membaca data KTP Anda! Silakan periksa kembali jika ada kesalahan ketik.' });
      } else {
        setNotif({ tipe: 'warning', pesan: 'AI belum optimal membaca KTP, Anda dapat mengisi data manual di bawah.' });
      }
    } catch (err) {
      setNotif({ tipe: 'warning', pesan: 'Gagal menghubungkan AI OCR. Silakan isi form KTP manual.' });
    } finally {
      setScanningKtp(false);
    }
  };

  // Tahap 1 -> Tahap 2
  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!step1.namaUser || !step1.emailUser || !step1.noTelepon || !step1.password) {
      setNotif({ tipe: 'error', pesan: 'Semua kolom tahap 1 wajib diisi.' });
      return;
    }
    setNotif(null);
    setStep(2);
  };

  // Submit Final (Hanya Disimpan di Sini Sesuai task1.md)
  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    if (!ktpData.nik || !ktpData.namaKtp || !ktpData.rtId || !ktpData.nomorRumah) {
      setNotif({ tipe: 'error', pesan: 'Harap lengkapi NIK, Nama KTP, RT, dan Nomor Rumah.' });
      return;
    }

    setSubmitting(true);
    setNotif(null);

    try {
      const payload = {
        ...step1,
        ...ktpData,
        fotoKtpBase64: fotoKtp
      };

      const res = await registrasiWargaAction(payload);
      if (res.success) {
        window.location.href = res.redirectTo || '/warga/beranda';
      } else {
        setNotif({ tipe: 'error', pesan: res.error || 'Pendaftaran gagal.' });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-xl mx-auto">
      <SiteBackground />

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Progress Bar Tahapan */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600">
            <span className={step === 1 ? 'text-[#2d6a4f]' : 'text-stone-400'}>
              1. Akun Dasar
            </span>
            <span className={step === 2 ? 'text-[#2d6a4f]' : 'text-stone-400'}>
              2. KTP & Wilayah Rumah
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2">
            <div
              className="bg-[#2d6a4f] h-2 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Header Judul */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-stone-900">
            {step === 1 ? 'Pendaftaran Warga Baru' : 'Foto KTP & Alamat Rumah'}
          </h2>
          <p className="text-xs text-stone-500">
            {step === 1
              ? 'Langkah 1: Masukkan data diri dan kata sandi akun Anda'
              : 'Langkah 2: Verifikasi foto KTP dengan AI dan masukkan RT/RW Anda'}
          </p>
        </div>

        {notif && <Notifikasi tipe={notif.tipe} pesan={notif.pesan} onClose={() => setNotif(null)} />}

        {/* ===================== TAHAP 1: DATA AKUN ===================== */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Nama Lengkap Warga
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={step1.namaUser}
                  onChange={(e) => setStep1({ ...step1, namaUser: e.target.value })}
                  placeholder="Contoh: Siti Rahmawati"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f]"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Nama Pengguna (Username)
                </label>
                <input
                  type="text"
                  value={step1.username}
                  onChange={(e) => setStep1({ ...step1, username: e.target.value })}
                  placeholder="sitir01 (opsional)"
                  className="w-full px-3.5 py-3 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Nomor Handphone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={step1.noTelepon}
                    onChange={(e) => setStep1({ ...step1, noTelepon: e.target.value })}
                    placeholder="08123456789"
                    className="w-full pl-10 pr-4 py-3 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f]"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={step1.emailUser}
                  onChange={(e) => setStep1({ ...step1, emailUser: e.target.value })}
                  placeholder="warga@email.com"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f]"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={step1.password}
                  onChange={(e) => setStep1({ ...step1, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f]"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Lanjut ke Foto KTP</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* ===================== TAHAP 2: FOTO KTP + OCR + RT/RW ===================== */}
        {step === 2 && (
          <form onSubmit={handleSubmitFinal} className="space-y-5">
            {/* Area Kamera / Foto dengan Frame Pengarah KTP */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700 uppercase">
                Foto Langsung KTP dengan Frame Panduan
              </label>

              {/* Jendela Preview Kamera atau Hasil Foto */}
              <div className="relative w-full aspect-16/10 bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-stone-300">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    {/* Frame Pembidik KTP */}
                    <div className="absolute inset-4 border-2 border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                      <span className="text-[10px] text-emerald-300 font-bold bg-black/40 px-2 py-0.5 rounded-sm self-start">
                        Arahkan KTP ke dalam garis kotak
                      </span>
                    </div>
                  </>
                ) : fotoKtp ? (
                  <img src={fotoKtp} alt="KTP Warga" className="w-full h-full object-contain bg-black" />
                ) : (
                  <div className="text-center p-4 text-stone-400 space-y-2">
                    <CreditCard className="w-10 h-10 mx-auto text-stone-400" />
                    <p className="text-xs">Foto KTP belum diambil</p>
                  </div>
                )}

                {/* Overlay Loading saat AI menerjemahkan KTP */}
                {scanningKtp && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white gap-2 z-20">
                    <Spinner size="lg" />
                    <p className="text-xs font-bold animate-pulse">AI sedang membaca data KTP Anda...</p>
                  </div>
                )}
              </div>

              {/* Tombol Aksi Kamera / Upload */}
              <div className="flex gap-2">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-stone-200"
                  >
                    <Camera className="w-4 h-4 text-[#2d6a4f]" />
                    <span>{fotoKtp ? 'Foto Ulang' : 'Buka Kamera'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-2.5 px-3 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Ambil Foto KTP</span>
                  </button>
                )}

                <label className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-stone-200 cursor-pointer">
                  <Upload className="w-4 h-4 text-stone-600" />
                  <span>Upload Berkas</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Hasil Ekstraksi KTP yang Dapat Diedit */}
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <span className="text-xs font-bold text-stone-700 uppercase block">
                Hasil Bacaan KTP (Dapat Diperbaiki Manual)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600">NIK (Nomor KTP)</label>
                  <input
                    type="text"
                    required
                    value={ktpData.nik}
                    onChange={(e) => setKtpData({ ...ktpData, nik: e.target.value })}
                    placeholder="16 digit NIK"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600">Nama pada KTP</label>
                  <input
                    type="text"
                    required
                    value={ktpData.namaKtp}
                    onChange={(e) => setKtpData({ ...ktpData, namaKtp: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600">Alamat Lengkap KTP</label>
                <textarea
                  rows={2}
                  value={ktpData.alamatKtp}
                  onChange={(e) => setKtpData({ ...ktpData, alamatKtp: e.target.value })}
                  placeholder="Jalan, Gang, Blok..."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={ktpData.tanggalLahir}
                    onChange={(e) => setKtpData({ ...ktpData, tanggalLahir: e.target.value })}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600">Pekerjaan</label>
                  <input
                    type="text"
                    value={ktpData.pekerjaan}
                    onChange={(e) => setKtpData({ ...ktpData, pekerjaan: e.target.value })}
                    placeholder="Pekerjaan"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Wilayah RT, RW, dan Nomor Rumah */}
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <span className="text-xs font-bold text-stone-700 uppercase block">
                Alamat Rumah Domisili (Untuk Pengambilan Sampah)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600">Pilih RW</label>
                  <select
                    required
                    value={ktpData.rwId}
                    onChange={(e) => setKtpData({ ...ktpData, rwId: e.target.value, rtId: '' })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  >
                    <option value="">-- Pilih RW --</option>
                    {wilayah.rw.map(rw => (
                      <option key={rw.id} value={rw.id}>RW {rw.nomor}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600">Pilih RT</label>
                  <select
                    required
                    value={ktpData.rtId}
                    onChange={(e) => setKtpData({ ...ktpData, rtId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  >
                    <option value="">-- Pilih RT --</option>
                    {wilayah.rt
                      .filter(rt => !ktpData.rwId || rt.rw_id === ktpData.rwId)
                      .map(rt => (
                        <option key={rt.id} value={rt.id}>RT {rt.nomor}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600">Nomor / Blok Rumah</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ktpData.nomorRumah}
                    onChange={(e) => setKtpData({ ...ktpData, nomorRumah: e.target.value })}
                    placeholder="Contoh: No. 12A atau Blok C-4"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                  <Home className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Nomor rumah ini akan dicantumkan pada QR Code Rumah Anda untuk petugas patroli.
                </span>
              </div>
            </div>

            {/* Tombol Kembali & Submit Akhir */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {submitting ? <Spinner size="sm" /> : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Kirim & Selesaikan Pendaftaran</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs text-stone-500 hover:text-[#2d6a4f]">
            Sudah punya akun? <strong>Masuk di sini</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}
