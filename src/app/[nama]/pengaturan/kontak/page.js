'use client';

import { useParams } from 'next/navigation';
import { Phone, Mail, MapPin, User, Shield, BookOpen, FileText } from 'lucide-react';

export default function PengaturanKontakPage() {
  const params = useParams();
  const role = params?.nama?.toLowerCase();

  const navLinks = [
    { label: 'Profil & QR', href: `/${role}/pengaturan/profil`, icon: User },
    { label: 'Keamanan Sandi', href: `/${role}/pengaturan/keamanan`, icon: Shield },
    { label: 'Panduan Warga', href: `/${role}/pengaturan/panduan`, icon: BookOpen },
    { label: 'Kebijakan Privasi', href: `/${role}/pengaturan/kebijakanPrivasi`, icon: FileText },
    { label: 'Kontak Pengurus', href: `/${role}/pengaturan/kontak`, icon: Phone, active: true }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Kontak & Bantuan Lingkungan</h2>
        <p className="text-xs sm:text-sm text-stone-500">Hubungi pengurus RT, petugas patroli, atau posko KKN</p>
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

      <div className="space-y-3">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Phone className="w-4 h-4 text-[#2d6a4f]" />
            <span>Layanan Pengangkutan Sampah & Darurat</span>
          </div>
          <p className="text-xs text-stone-500">
            Hubungi posko petugas kebersihan jika ada tumpukan sampah atau jadwal khusus.
          </p>
          <div className="pt-2 text-sm font-bold text-[#2d6a4f]">
            📞 WhatsApp / Telp: 0812-3456-7890
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Mail className="w-4 h-4 text-[#2d6a4f]" />
            <span>Posko Pengaduan & Bantuan KKN Tematik</span>
          </div>
          <p className="text-xs text-stone-500">
            Punya saran, masukan perbaikan aplikasi, atau pertanyaan seputar pemilahan sampah?
          </p>
          <div className="pt-2 text-xs font-semibold text-stone-700">
            ✉ Email Posko: kkn.sampah@lingkungan.desa.id
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <MapPin className="w-4 h-4 text-[#2d6a4f]" />
            <span>Alamat Kantor Balai Warga & Bank Sampah</span>
          </div>
          <p className="text-xs text-stone-600">
            Kantor Posko Bersama KKN Tematik Pengolahan Sampah Lingkungan RT/RW, Gedung Balai Pertemuan Warga.
          </p>
        </div>
      </div>
    </div>
  );
}
