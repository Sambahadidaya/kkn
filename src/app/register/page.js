'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getDaftarWilayahAction, registrasiWargaAction } from '../../api/supabase/public/registrasi';
import { scanKtpAction } from '../../api/openai/scanktp';
import Notifikasi from '../../components/notifikasi';
import Spinner from '../../components/spinner';
import SiteBackground from '../../components/siteBackground';
import ToggleTheme from '../../components/toggleTheme';
import PasswordInput from '../../components/passwordInput';
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateNama
} from '../../scurity/formatLimitKarak';
import ScannerAnimation from '../../components/animasi/scanner';
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  User,
  Mail,
  Phone,
  Lock,
  Home,
  X,
  Sun,
  Crosshair,
  RotateCcw,
  Sliders
} from 'lucide-react';

export default function RegisterPage() {
  // 4 Tahap: 1 = Nama Saja, 2 = Scan Foto KTP, 3 = Data KTP & Domisili, 4 = Email, No. HP & Kata Sandi
  const [step, setStep] = useState(1);
  const [wilayah, setWilayah] = useState({ rw: [], rt: [] });
  const [loadingWilayah, setLoadingWilayah] = useState(true);

  // Data Tahap 1: Nama Saja
  const [namaUser, setNamaUser] = useState('');

  // Data Tahap 2: Foto KTP & Scanning AI
  const [fotoKtp, setFotoKtp] = useState(null); // base64 data URL
  const [scanningKtp, setScanningKtp] = useState(false);

  // Data Tahap 3: Hasil OCR & Wilayah
  const [ktpData, setKtpData] = useState({
    nik: '',
    namaKtp: '',
    alamatKtp: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: 'LAKI-LAKI',
    pekerjaan: '',
    detailKtp: '',
    nomorRw: '',
    nomorRt: '',
    nomorRumah: ''
  });

  // Data Tahap 4: Kontak & Kata Sandi
  const [accountData, setAccountData] = useState({
    emailUser: '',
    noTelepon: '',
    password: '',
    konfirmasiPassword: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState(null);

  // Video / Camera Stream & Fullscreen state
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Kontrol Kamera Konvensional (Fokus & Kecerahan)
  const [brightness, setBrightness] = useState(100);
  const [showBrightnessSlider, setShowBrightnessSlider] = useState(false);
  const [focusPoint, setFocusPoint] = useState(null);
  const [isFocusing, setIsFocusing] = useState(false);

  useEffect(() => {
    async function fetchWilayah() {
      try {
        const res = await getDaftarWilayahAction();
        setWilayah({ rw: res.rw || [], rt: res.rt || [] });
      } catch (err) {
        console.error('Gagal mengambil daftar wilayah:', err);
      } finally {
        setLoadingWilayah(false);
      }
    }
    fetchWilayah();

    return () => {
      stopCameraStream();
    };
  }, []);

  // Pasang stream ke elemen video saat kamera aktif dan videoRef sudah siap di DOM
  useEffect(() => {
    if (cameraActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current
        .play()
        .catch(err => console.warn('Video play interrupted:', err));
    }
  }, [cameraActive]);

  // Hentikan media stream & reset kontrol kamera
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (_) { }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setBrightness(100);
    setShowBrightnessSlider(false);
    setFocusPoint(null);
    setIsFocusing(false);
  };

  // Interaksi Tap-to-Focus kamera konvensional
  const handleTapToFocus = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

    if (clientX !== undefined && clientY !== undefined) {
      setFocusPoint({ x: clientX - rect.left, y: clientY - rect.top });
      setIsFocusing(true);
      setTimeout(() => setIsFocusing(false), 1200);
    }

    try {
      const track = mediaStreamRef.current?.getVideoTracks()?.[0];
      if (track && track.applyConstraints) {
        const caps = track.getCapabilities ? track.getCapabilities() : {};
        if (caps.focusMode && caps.focusMode.includes('continuous')) {
          track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => {});
        }
      }
    } catch (_) {}
  };

  // Nyalakan Kamera dengan Fallback constraint
  const startCamera = async () => {
    setCameraError(null);
    setNotif(null);
    setBrightness(100);
    setShowBrightnessSlider(false);
    setFocusPoint(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser ini tidak mendukung akses kamera atau koneksi tidak aman (harus localhost / HTTPS).');
      return;
    }

    stopCameraStream();

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
    } catch (err1) {
      console.warn('Gagal membuka kamera environment, mencoba constraint standar:', err1);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } catch (err2) {
        console.error('Kamera tidak dapat diakses:', err2);
        let pesan = 'Tidak dapat membuka kamera. ';
        if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError') {
          pesan += 'Izin akses kamera ditolak. Silakan berikan izin kamera pada browser.';
        } else if (err2.name === 'NotFoundError' || err2.name === 'DevicesNotFoundError') {
          pesan += 'Perangkat kamera tidak ditemukan.';
        } else if (err2.name === 'NotReadableError' || err2.name === 'TrackStartError') {
          pesan += 'Kamera sedang digunakan oleh aplikasi lain.';
        } else {
          pesan += err2.message || 'Silakan coba lagi.';
        }
        setCameraError(pesan);
        return;
      }
    }

    if (stream) {
      mediaStreamRef.current = stream;
      setCameraActive(true);
    }
  };

  // Jepret foto dari stream video (terapkan filter kecerahan jika disesuaikan)
  const capturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');

      if (brightness !== 100) {
        ctx.filter = `brightness(${brightness}%) contrast(105%)`;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCameraStream();
      processKtpPhoto(dataUrl);
    } catch (err) {
      console.error('Gagal mengambil foto:', err);
      setNotif({ tipe: 'error', pesan: 'Gagal mengambil gambar dari kamera: ' + err.message });
    }
  };

  // Proses Foto dengan AI OCR
  const processKtpPhoto = async (dataUrl) => {
    setScanningKtp(true);
    setNotif(null);

    try {
      const res = await scanKtpAction(dataUrl);
      if (res.success && res.data && res.isKtp !== false && res.data.nik) {
        const d = res.data;
        setFotoKtp(dataUrl);

        // Ekstraksi dan sanitasi nama dari hasil pembacaan AI Vision KTP
        let ocrNama = d.nama || d.nama_lengkap || d.Nama || '';
        if (typeof ocrNama === 'string') {
          ocrNama = ocrNama.replace(/^nama\s*[:\-\.]?\s*/i, '').trim();
          ocrNama = ocrNama.replace(/^["']|["']$/g, '').trim();
        }

        // Tampilkan nama KTP hasil scan, jangan timpa dengan nama akun kecuali jika OCR tidak menemukan
        const namaHasilScan = ocrNama || d.nama || namaUser || '';

        // Deteksi nomor RT dan RW dari hasil OCR jika ada (misal format "003/005")
        let autoRt = '';
        let autoRw = '';
        if (d.rt_rw) {
          const matchRtRw = String(d.rt_rw).match(/(\d+)\s*[\/\-]\s*(\d+)/);
          if (matchRtRw) {
            autoRt = String(parseInt(matchRtRw[1], 10) || '');
            autoRw = String(parseInt(matchRtRw[2], 10) || '');
          }
        }

        setKtpData(prev => ({
          ...prev,
          nik: d.nik || prev.nik,
          namaKtp: namaHasilScan,
          alamatKtp: d.alamat || prev.alamatKtp,
          tempatLahir: d.tempat_lahir || prev.tempatLahir,
          tanggalLahir: d.tanggal_lahir || prev.tanggalLahir,
          jenisKelamin: d.jenis_kelamin?.toUpperCase().includes('PEREMPUAN') ? 'PEREMPUAN' : 'LAKI-LAKI',
          pekerjaan: d.pekerjaan || prev.pekerjaan,
          nomorRt: autoRt || prev.nomorRt,
          nomorRw: autoRw || prev.nomorRw,
          detailKtp: JSON.stringify(d)
        }));
        setNotif({
          tipe: 'sukses',
          pesan: 'KTP terverifikasi dan berhasil dibaca AI! Silakan periksa data hasil scan.'
        });
      } else {
        setFotoKtp(null);
        setNotif({
          tipe: 'error',
          pesan: res.error || 'Gambar yang diambil bukan foto KTP atau informasi KTP tidak terbaca. Harap posisikan KTP Anda di dalam bingkai panduan lalu ambil foto ulang.'
        });
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setFotoKtp(null);
      setNotif({
        tipe: 'error',
        pesan: 'Gagal memproses pemindaian KTP. Pastikan koneksi internet stabil dan ambil foto ulang.'
      });
    } finally {
      setScanningKtp(false);
    }
  };

  // Validasi Tahap 1 (Hanya Nama Saja) -> Pindah ke Tahap 2
  const handleNextStep1 = (e) => {
    e.preventDefault();
    const namaCheck = validateNama(namaUser);
    if (!namaCheck.valid) {
      setNotif({ tipe: 'error', pesan: namaCheck.message });
      return;
    }
    setNotif(null);
    setStep(2);
  };

  // Validasi Tahap 2 -> Pindah ke Tahap 3
  const handleNextStep2 = () => {
    if (!fotoKtp) {
      setNotif({ tipe: 'error', pesan: 'Silakan ambil foto KTP terlebih dahulu.' });
      return;
    }
    stopCameraStream();
    setNotif(null);
    setStep(3);
  };

  // Validasi Tahap 3 -> Pindah ke Tahap 4
  const handleNextStep3 = (e) => {
    e.preventDefault();
    if (!ktpData.nik || !ktpData.namaKtp || !ktpData.nomorRt || !ktpData.nomorRw || !ktpData.nomorRumah) {
      setNotif({ tipe: 'error', pesan: 'Harap lengkapi NIK, Nama KTP, Nomor RT, Nomor RW, dan Nomor Rumah.' });
      return;
    }
    setNotif(null);
    setStep(4);
  };

  // Submit Final (Tahap 4: Email, Telepon, Kata Sandi)
  const handleSubmitFinal = async (e) => {
    e.preventDefault();

    // Validasi format nomor telepon
    const phoneCheck = validatePhone(accountData.noTelepon);
    if (!phoneCheck.valid) {
      setNotif({ tipe: 'error', pesan: phoneCheck.message });
      return;
    }

    // Validasi format email
    const emailCheck = validateEmail(accountData.emailUser);
    if (!emailCheck.valid) {
      setNotif({ tipe: 'error', pesan: emailCheck.message });
      return;
    }

    // Validasi format kata sandi
    const pwdCheck = validatePassword(accountData.password);
    if (!pwdCheck.valid) {
      setNotif({ tipe: 'error', pesan: pwdCheck.message });
      return;
    }

    // Validasi konfirmasi kata sandi
    if (accountData.konfirmasiPassword && accountData.password !== accountData.konfirmasiPassword) {
      setNotif({ tipe: 'error', pesan: 'Konfirmasi kata sandi tidak cocok dengan kata sandi.' });
      return;
    }

    setSubmitting(true);
    setNotif(null);

    try {
      const payload = {
        namaUser,
        emailUser: accountData.emailUser.trim(),
        noTelepon: accountData.noTelepon.trim(),
        password: accountData.password,
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
      setNotif({ tipe: 'error', pesan: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-xl mx-auto relative">
      <SiteBackground />

      {/* Floating Toggle Theme Pojok Kanan Atas */}
      <div className="absolute top-4 right-4 z-20">
        <ToggleTheme />
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xl p-6 sm:p-8 space-y-6 transition-colors">
        {/* Progress Bar 4 Tahap */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold">
            <span className={step === 1 ? 'text-[#2d6a4f] dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}>
              1. Nama
            </span>
            <span className={step === 2 ? 'text-[#2d6a4f] dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}>
              2. Foto KTP
            </span>
            <span className={step === 3 ? 'text-[#2d6a4f] dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}>
              3. Data & Domisili
            </span>
            <span className={step === 4 ? 'text-[#2d6a4f] dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}>
              4. Akun & Sandi
            </span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#2d6a4f] dark:bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%'
              }}
            />
          </div>
        </div>

        {/* Header Judul Tahapan */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {step === 1 && 'Pendaftaran Warga Baru'}
            {step === 2 && 'Scan / Foto Kartu Tanda Penduduk'}
            {step === 3 && 'Hasil Scan KTP & Alamat Domisili'}
            {step === 4 && 'Kontak & Kata Sandi Akun'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {step === 1 && 'Langkah 1 dari 4: Masukkan nama lengkap Anda'}
            {step === 2 && 'Langkah 2 dari 4: Buka kamera untuk memindai kartu KTP Anda'}
            {step === 3 && 'Langkah 3 dari 4: Verifikasi hasil pembacaan KTP dan tentukan alamat RT/RW'}
            {step === 4 && 'Langkah 4 dari 4: Masukkan nomor HP, email, dan kata sandi akun'}
          </p>
        </div>

        {notif && <Notifikasi tipe={notif.tipe} pesan={notif.pesan} onClose={() => setNotif(null)} />}

        {/* ===================== TAHAP 1: CUKUP NAMA SAJA ===================== */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                Nama Lengkap Warga
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={namaUser}
                  onChange={(e) => setNamaUser(e.target.value)}
                  placeholder="Contoh: Siti Rahmawati"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden placeholder:text-stone-400 dark:placeholder:text-stone-500"
                />
                <User className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">
                Nama pengguna (username) akan dibuat secara otomatis dari nama Anda dan dapat diubah nanti di menu Pengaturan.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <span>Lanjut ke Foto KTP</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* ===================== TAHAP 2: SCAN / AMBIL FOTO KTP ===================== */}
        {step === 2 && (
          <div className="space-y-5">
            {cameraError && (
              <Notifikasi tipe="warning" pesan={cameraError} onClose={() => setCameraError(null)} />
            )}

            {/* Area Preview Foto / Status Pembacaan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase">
                  Foto Kartu Tanda Penduduk (KTP)
                </label>
                {fotoKtp && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Foto Tersedia
                  </span>
                )}
              </div>

              {/* Jendela Preview KTP */}
              <div className="relative w-full aspect-16/10 bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-700 shadow-inner">
                {fotoKtp ? (
                  <img
                    src={fotoKtp}
                    alt="Pratinjau KTP"
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="text-center p-6 text-stone-400 dark:text-stone-500 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-stone-800/80 flex items-center justify-center mx-auto text-stone-400">
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-stone-300">Belum ada foto KTP</p>
                      <p className="text-xs text-stone-400 max-w-xs mx-auto">
                        Buka kamera untuk memfokuskan KTP secara langsung dan membaca datanya dengan AI.
                      </p>
                    </div>
                  </div>
                )}

                {/* Overlay Scanning AI */}
                {scanningKtp && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-3 z-20">
                    <Spinner size="lg" />
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold animate-pulse flex items-center justify-center gap-1.5 text-emerald-300">
                        AI Vision sedang membaca KTP...
                      </p>
                      <p className="text-[11px] text-stone-300">
                        Mengekstrak NIK, Nama, dan alamat secara otomatis
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Aksi Kamera */}
              <div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-3.5 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>{fotoKtp ? 'Scan Ulang KTP (Buka Kamera)' : 'Buka Kamera & Mulai Scan KTP'}</span>
                </button>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700/80 text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
                <p className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  Petunjuk Pemindaian KTP:
                </p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Gunakan kamera langsung. Posisikan KTP pas di dalam bingkai panduan.</li>
                  <li>Arahkan <strong>pas foto wajah KTP</strong> pada kotak panduan wajah di sebelah kanan.</li>
                  <li>Sistem AI akan memverifikasi keaslian dan mengekstrak data KTP Anda secara otomatis.</li>
                </ul>
              </div>
            </div>

            {/* Navigasi Tahap 2: Kembali ke Tahap 1 atau Lanjut ke Tahap 3 */}
            <div className="flex gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setStep(1);
                }}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep2}
                disabled={!fotoKtp || scanningKtp}
                className="flex-1 py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {scanningKtp ? (
                  <>
                    <Spinner size="sm" />
                    <span>Menunggu AI Selesai...</span>
                  </>
                ) : (
                  <>
                    <span>Lanjut ke Data KTP & Wilayah</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===================== TAHAP 3: HASIL SCAN KTP & ALAMAT DOMISILI ===================== */}
        {step === 3 && (
          <form onSubmit={handleNextStep3} className="space-y-5">
            {/* Kartu Ringkasan Foto KTP */}
            <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 rounded-2xl gap-3">
              <div className="flex items-center gap-3">
                {fotoKtp && (
                  <img
                    src={fotoKtp}
                    alt="Foto KTP Mini"
                    className="w-16 h-11 object-cover rounded-lg border border-stone-300 dark:border-stone-600 shadow-xs"
                  />
                )}
                <div>
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Foto KTP Terverifikasi</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">AI telah membaca informasi di bawah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-[#2d6a4f] dark:text-emerald-400 hover:underline px-2 py-1 cursor-pointer"
              >
                Foto Ulang
              </button>
            </div>

            {/* Hasil Ekstraksi KTP yang Dapat Diedit */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase block">
                  Data KTP (Dapat Diperbaiki Manual)
                </span>
                <span className="text-[10px] text-stone-400">Periksa kecocokan data</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    NIK (Nomor KTP) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={ktpData.nik}
                    onChange={(e) => setKtpData({ ...ktpData, nik: e.target.value })}
                    placeholder="16 digit NIK"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Nama pada KTP *
                  </label>
                  <input
                    type="text"
                    required
                    value={ktpData.namaKtp}
                    onChange={(e) => setKtpData({ ...ktpData, namaKtp: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Alamat Lengkap KTP
                </label>
                <textarea
                  rows={2}
                  value={ktpData.alamatKtp}
                  onChange={(e) => setKtpData({ ...ktpData, alamatKtp: e.target.value })}
                  placeholder="Jalan, Gang, Blok sesuai KTP..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="text"
                    value={ktpData.tanggalLahir}
                    onChange={(e) => setKtpData({ ...ktpData, tanggalLahir: e.target.value })}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Pekerjaan
                  </label>
                  <input
                    type="text"
                    value={ktpData.pekerjaan}
                    onChange={(e) => setKtpData({ ...ktpData, pekerjaan: e.target.value })}
                    placeholder="Pekerjaan"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Wilayah RT, RW, dan Nomor Rumah */}
            <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase block">
                Alamat Rumah Domisili (Untuk Pengambilan Sampah)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Nomor RW *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={999}
                    value={ktpData.nomorRw}
                    onChange={(e) => setKtpData({ ...ktpData, nomorRw: e.target.value })}
                    placeholder="Contoh: 5"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Nomor RT *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={999}
                    value={ktpData.nomorRt}
                    onChange={(e) => setKtpData({ ...ktpData, nomorRt: e.target.value })}
                    placeholder="Contoh: 2"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Nomor / Blok Rumah *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ktpData.nomorRumah}
                    onChange={(e) => setKtpData({ ...ktpData, nomorRumah: e.target.value })}
                    placeholder="Contoh: No. 12A atau Blok C-4"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden"
                  />
                  <Home className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-2.5" />
                </div>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">
                  Nomor rumah ini akan dicantumkan pada QR Code Rumah Anda untuk petugas sampah.
                </span>
              </div>
            </div>

            {/* Tombol Kembali & Lanjut ke Tahap 4 */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Lanjut ke Kontak & Sandi</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* ===================== TAHAP 4: EMAIL, NO TELEPON, DAN KATA SANDI ===================== */}
        {step === 4 && (
          <form onSubmit={handleSubmitFinal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                Nomor Handphone (Telepon) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={accountData.noTelepon}
                  onChange={(e) => setAccountData({ ...accountData, noTelepon: e.target.value })}
                  placeholder="Contoh: 08123456789 atau +6281234567890"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden placeholder:text-stone-400 dark:placeholder:text-stone-500"
                />
                <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3.5" />
              </div>
              <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                Format 08xx atau +62 dengan total 12-15 angka.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                Alamat Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={accountData.emailUser}
                  onChange={(e) => setAccountData({ ...accountData, emailUser: e.target.value })}
                  placeholder="Contoh: warga@domain.com"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden placeholder:text-stone-400 dark:placeholder:text-stone-500"
                />
                <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3.5" />
              </div>
              <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                Email aktif untuk konfirmasi dan akses masuk akun.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                Kata Sandi *
              </label>
              <PasswordInput
                value={accountData.password}
                onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
              <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                Gunakan ikon mata untuk memeriksa kata sandi yang Anda ketik.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                Konfirmasi Kata Sandi *
              </label>
              <PasswordInput
                value={accountData.konfirmasiPassword}
                onChange={(e) => setAccountData({ ...accountData, konfirmasiPassword: e.target.value })}
                placeholder="Ketik ulang kata sandi"
                required
                minLength={6}
              />
            </div>

            {/* Tombol Aksi Tahap 4 */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
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
          <Link href="/login" className="text-xs text-stone-500 dark:text-stone-400 hover:text-[#2d6a4f] dark:hover:text-emerald-400">
            Sudah punya akun? <strong>Masuk di sini</strong>
          </Link>
        </div>
      </div>

      {/* ===================== MODAL FULLSCREEN SCANNER KAMERA ===================== */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none animate-in fade-in duration-200">
          {/* Header Kamera Fullscreen */}
          <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent z-20 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                  Pemindai KTP Landscape
                </span>
                <span className="text-[10px] text-stone-300">
                  Arahkan KTP secara horizontal di dalam bingkai
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tombol Toggle Kontrol Kecerahan & Fokus */}
              <button
                type="button"
                onClick={() => setShowBrightnessSlider(prev => !prev)}
                aria-label="Atur Kecerahan"
                className={`p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                  showBrightnessSlider || brightness !== 100
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/30'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>

              {/* Tombol Tutup / Batal */}
              <button
                type="button"
                onClick={stopCameraStream}
                aria-label="Tutup Kamera"
                className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Area Video Stream dengan Tap-to-Focus & Bingkai Panduan KTP Landscape */}
          <div
            onClick={handleTapToFocus}
            onTouchStart={handleTapToFocus}
            className="relative flex-1 flex items-center justify-center overflow-hidden cursor-crosshair"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                filter: brightness !== 100 ? `brightness(${brightness}%) contrast(105%)` : 'none'
              }}
              className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-150"
            />

            {/* Indikator Reticle Tap-to-Focus Kamera Konvensional */}
            {focusPoint && (
              <div
                className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2"
                style={{ left: focusPoint.x, top: focusPoint.y }}
              >
                <div
                  className={`w-14 h-14 border-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
                    isFocusing
                      ? 'border-amber-400 scale-90 shadow-[0_0_15px_rgba(251,191,36,0.9)] bg-amber-400/10'
                      : 'border-emerald-400 scale-100 shadow-[0_0_10px_rgba(52,211,153,0.7)]'
                  }`}
                >
                  <div className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping" />
                </div>
                <span className="text-[9px] font-mono text-amber-300 font-bold bg-black/70 px-1.5 py-0.5 rounded absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  FOKUS
                </span>
              </div>
            )}

            {/* Bingkai Panduan KTP Landscape Standar (Rasio ISO 85.6mm x 53.98mm ~ 1.586:1) */}
            <div className="relative z-10 w-[94%] max-w-xl aspect-[1.586/1] rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none flex flex-col justify-between p-3.5 sm:p-5">
              {/* Animasi Pemindai Laser Looping dari animasi/scanner.js */}
              <ScannerAnimation active={cameraActive} />

              {/* Header Kartu KTP Landscape */}
              <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-emerald-300 z-10">
                <span className="bg-black/65 px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5 border border-emerald-500/30">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  REPUBLIK INDONESIA
                </span>
                <span className="bg-black/65 px-2.5 py-1 rounded-md backdrop-blur-xs text-stone-300 border border-stone-600/30">
                  KARTU TANDA PENDUDUK
                </span>
              </div>

              {/* Area Dalam KTP: Garis Panduan Identitas (Div NIK telah dihapus) & Pas Foto Wajah di Kanan */}
              <div className="flex items-center justify-between gap-3 my-auto h-full max-h-[72%] z-10">
                {/* Sisi Kiri: Garis Panduan Teks KTP Landscape */}
                <div className="flex-1 space-y-2 py-1 pr-2">
                  <div className="space-y-1.5 opacity-70">
                    <div className="h-2 bg-emerald-400/40 rounded w-1/3" />
                    <div className="h-1.5 bg-emerald-400/30 rounded w-4/5" />
                    <div className="h-1.5 bg-emerald-400/30 rounded w-full" />
                    <div className="h-1.5 bg-emerald-400/30 rounded w-3/4" />
                    <div className="h-1.5 bg-emerald-400/25 rounded w-1/2" />
                    <div className="h-1.5 bg-emerald-400/25 rounded w-2/3" />
                  </div>
                </div>

                {/* Sisi Kanan: Kotak Panduan Pas Foto Wajah */}
                <div className="w-[28%] sm:w-[26%] aspect-[3/4] border-2 border-dashed border-emerald-300 bg-emerald-400/15 backdrop-blur-2xs rounded-xl flex flex-col items-center justify-center p-1.5 text-center shadow-lg">
                  <User className="w-7 h-7 sm:w-9 sm:h-9 text-emerald-200 mb-1 animate-pulse" />
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-white leading-tight bg-black/60 px-1 py-0.5 rounded">
                    PAS FOTO
                  </span>
                </div>
              </div>

              {/* Instruksi Bawah Bingkai Landscape */}
              <div className="text-center z-10">
                <span className="text-[10px] sm:text-[11px] font-medium text-emerald-200 bg-black/75 px-3.5 py-1 rounded-full backdrop-blur-xs border border-emerald-500/20">
                  Posisikan KTP Landscape di dalam bingkai • Tap layar untuk fokus
                </span>
              </div>
            </div>
          </div>

          {/* Panel Pengaturan Kecerahan Kamera Konvensional (Floating Slider) */}
          {showBrightnessSlider && (
            <div className="mx-auto max-w-sm w-[90%] mb-2 p-3 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-700/80 text-white z-20 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Sun className="w-4 h-4" />
                  <span>Kecerahan Kamera</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-stone-300">{brightness}%</span>
                  {brightness !== 100 && (
                    <button
                      type="button"
                      onClick={() => setBrightness(100)}
                      className="p-1 text-[10px] text-stone-400 hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Sun className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="range"
                  min="60"
                  max="160"
                  step="5"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
                />
                <Sun className="w-5 h-5 text-amber-300" />
              </div>
            </div>
          )}

          {/* Kontrol Bawah: Tombol Jepret Foto, Pengaturan, & Batal */}
          <div className="p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 flex items-center justify-between max-w-md mx-auto w-full">
            {/* Tombol Batal */}
            <button
              type="button"
              onClick={stopCameraStream}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
            >
              Batal
            </button>

            {/* Shutter Button Ambil Foto (Kamera Konvensional) */}
            <button
              type="button"
              onClick={capturePhoto}
              aria-label="Ambil Foto KTP"
              className="w-18 h-18 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-400 active:scale-95 shadow-xl shadow-emerald-500/50 flex items-center justify-center text-white transition-all cursor-pointer group"
            >
              <Camera className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>

            {/* Tombol Kontrol Kecerahan Cepat */}
            <button
              type="button"
              onClick={() => setShowBrightnessSlider(prev => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showBrightnessSlider
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-stone-200'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Kecerahan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
