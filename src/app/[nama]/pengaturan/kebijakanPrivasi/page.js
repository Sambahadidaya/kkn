'use client';

import { useParams } from 'next/navigation';
import { ShieldCheck, User, Shield, BookOpen, FileText, Phone, Lock } from 'lucide-react';

export default function PengaturanKebijakanPrivasiPage() {
  const params = useParams();
  const role = params?.nama?.toLowerCase();

  const navLinks = [
    { label: 'Profil & QR', href: `/${role}/pengaturan/profil`, icon: User },
    { label: 'Keamanan Sandi', href: `/${role}/pengaturan/keamanan`, icon: Shield },
    { label: 'Panduan Warga', href: `/${role}/pengaturan/panduan`, icon: BookOpen },
    { label: 'Kebijakan Privasi', href: `/${role}/pengaturan/kebijakanPrivasi`, icon: FileText, active: true },
    { label: 'Kontak Pengurus', href: `/${role}/pengaturan/kontak`, icon: Phone }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Kebijakan Privasi & Enkripsi</h2>
        <p className="text-xs sm:text-sm text-stone-500">Transparansi perlindungan data kependudukan KTP Anda</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {navLinks.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <a
              key={idx}
              href={item.href}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
                item.active
                  ? 'bg-[#2d6a4f] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-stone-900 text-base">
          <ShieldCheck className="w-5 h-5 text-[#2d6a4f]" />
          <span>Komitmen Perlindungan Identitas KTP</span>
        </div>

        <p>
          Dalam pelaksanaan KKN Tematik Pengolahan Sampah Lingkungan ini, keamanan dan kerahasiaan data kependudukan warga adalah prioritas tertinggi. Seluruh data identitas KTP (NIK, Nama Lengkap, Tanggal Lahir, Alamat) dienkripsi menggunakan algoritma standar militer <strong>AES-256-GCM</strong> di sisi server.
        </p>

        <h4 className="font-bold text-stone-800 text-xs uppercase pt-2">Hierarki Hak Akses Data:</h4>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Pengurus RT:</strong> Berwenang memverifikasi keabsahan data KTP warga yang berada di wilayah RT-nya masing-masing.</li>
          <li><strong>Pengurus RW & Kelurahan:</strong> Hanya berhak melihat angka agregat statistik (jumlah warga dan total tonase sampah) tanpa akses ke rincian KTP individu.</li>
          <li><strong>Petugas Lapangan:</strong> Hanya dapat melihat nomor rumah dan nama warga untuk keperluan penimbangan sampah melalui pemindaian QR code rumah.</li>
          <li><strong>Warga:</strong> Dapat mengajukan permohonan pembukaan kunci data KTP pribadi melalui persetujuan pengurus RT/RW/Kelurahan.</li>
        </ul>

        <div className="p-3 bg-[#f7faf8] border border-stone-200 rounded-xl text-xs text-stone-500">
          Untuk pertanyaan lebih lanjut mengenai perlindungan data pribadi, silakan hubungi tim aparatur atau admin kelurahan.
        </div>
      </div>
    </div>
  );
}
