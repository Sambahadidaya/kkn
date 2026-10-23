'use client';

import { useParams } from 'next/navigation';
import { PANDUAN_LIST } from '../../../../data/panduan';
import { BookOpen, User, Shield, FileText, Phone, HelpCircle } from 'lucide-react';

export default function PengaturanPanduanPage() {
  const params = useParams();
  const role = params?.nama?.toLowerCase();

  const navLinks = [
    { label: 'Profil & QR', href: `/${role}/pengaturan/profil`, icon: User },
    { label: 'Keamanan Sandi', href: `/${role}/pengaturan/keamanan`, icon: Shield },
    { label: 'Panduan Warga', href: `/${role}/pengaturan/panduan`, icon: BookOpen, active: true },
    { label: 'Kebijakan Privasi', href: `/${role}/pengaturan/kebijakanPrivasi`, icon: FileText },
    { label: 'Kontak Pengurus', href: `/${role}/pengaturan/kontak`, icon: Phone }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Panduan Aplikasi & Pemilahan</h2>
        <p className="text-xs sm:text-sm text-stone-500">Petunjuk praktis untuk warga segala usia</p>
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

      <div className="space-y-4">
        {PANDUAN_LIST.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#2d6a4f]" />
              <span>{p.judul}</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">{p.ringkasan}</p>

            <ul className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-700">
              {p.langkah.map((l, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#d8f3dc] text-[#1b4332] font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{l}</span>
                </li>
              ))}
            </ul>

            {p.poinInfo && (
              <div className="p-3 bg-[#eef8f2] rounded-xl text-xs font-semibold text-[#1b4332]">
                💡 {p.poinInfo}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
