'use client';

import { useState } from 'react';
import CardTutorial from '../../../components/public/cardTutorial';
import { KATEGORI_SAMPAH_INFO, TUTORIAL_VIDEOS } from '../../../data/tutorial';
import { getYouTubeEmbedUrl } from '../../../utils/youtubeUtils';
import { getGDriveEmbedUrl } from '../../../utils/gdriveUtils';
import { BookOpen, Film, Lightbulb } from 'lucide-react';

export default function EdukasiPage() {
  const [activeTab, setActiveTab] = useState('kategori'); // 'kategori' | 'video'

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#2d6a4f]" />
          <span>Edukasi & Panduan Pemilahan</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Kenali kategori sampah rumah tangga Anda dan tonton video tutorial praktis
        </p>
      </div>

      {/* Tab Navigasi Edukasi */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('kategori')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'kategori'
              ? 'border-[#2d6a4f] text-[#2d6a4f]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Katalog Jenis Sampah</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'video'
              ? 'border-[#2d6a4f] text-[#2d6a4f]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Video Tutorial</span>
        </button>
      </div>

      {/* KONTEN 1: DAFTAR KATEGORI & KARTU SCROLL MENYAMPING SESUAI task1.md */}
      {activeTab === 'kategori' && (
        <div className="space-y-6">
          {KATEGORI_SAMPAH_INFO.map((kat) => (
            <CardTutorial key={kat.slug} kategori={kat} />
          ))}
        </div>
      )}

      {/* KONTEN 2: VIDEO TUTORIAL YOUTUBE & GDRIVE */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          {TUTORIAL_VIDEOS.map((vid) => {
            const embedUrl = vid.tipe === 'gdrive'
              ? getGDriveEmbedUrl(vid.url)
              : getYouTubeEmbedUrl(vid.url);

            return (
              <div
                key={vid.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden"
              >
                <div className="p-4 sm:p-5 border-b border-stone-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Video {vid.tipe?.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-stone-900 text-base sm:text-lg mt-1">{vid.judul}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{vid.deskripsi}</p>
                </div>

                <div className="w-full aspect-16/9 bg-black">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={vid.judul}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs">
                      Tautan video tidak dapat dimuat.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
