'use client';

import { useState, useEffect } from 'react';
import { getKategoriSampahAction } from '../../../api/supabase/public/tambah';
import { TUTORIAL_VIDEOS } from '../../../data/tutorial';
import Card from '../../../components/public/card';
import { Film, BookOpen, ExternalLink, Plus } from 'lucide-react';

export default function AdminEdukasiPage() {
  const [kategori, setKategori] = useState([]);
  const [jenis, setJenis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getKategoriSampahAction();
        setKategori(res.kategori || []);
        setJenis(res.jenis || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Kelola Materi Edukasi</h2>
        <p className="text-sm text-stone-500">Katalog jenis sampah, gambar, dan video tutorial edukasi warga</p>
      </div>

      {/* Daftar Kategori & Jenis Sampah */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#2d6a4f]" />
          <span>Kategori & Jenis Sampah</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kategori.map((kat) => {
            const jenisList = jenis.filter(j => j.kategori_id === kat.id);
            return (
              <Card
                key={kat.id}
                title={kat.nama}
                subtitle={`Slug: ${kat.slug}`}
              >
                <div className="space-y-3">
                  <p className="text-xs text-stone-600">{kat.deskripsi}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
                    {jenisList.length === 0 ? (
                      <span className="text-xs text-stone-400">Belum ada item khusus.</span>
                    ) : (
                      jenisList.map(j => (
                        <span key={j.id} className="text-xs bg-stone-100 px-2.5 py-1 rounded-lg text-stone-700">
                          {j.nama}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Video Tutorial Youtube / GDrive */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
          <Film className="w-5 h-5 text-[#2d6a4f]" />
          <span>Daftar Video Tutorial Aktif</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TUTORIAL_VIDEOS.map((vid) => (
            <div key={vid.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                {vid.tipe}
              </span>
              <h4 className="font-bold text-stone-900 text-sm">{vid.judul}</h4>
              <p className="text-xs text-stone-500">{vid.deskripsi}</p>
              <a
                href={vid.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#2d6a4f] hover:underline font-semibold pt-2"
              >
                <span>Buka Link Video</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
