'use client';

// Komponen Kartu Kategori Sampah yang Dapat Digeser Menyamping (Horizontal Scroll)
export default function CardTutorial({ kategori }) {
  const { slug, nama, badge, warna, deskripsi, items = [] } = kategori;

  // Placeholder SVG dinamis ramah visual sesuai kategori
  const getPlaceholderSvg = (itemNama, kSlug) => {
    const bgColors = {
      organik: '#10b981',
      nonorganik: '#3b82f6',
      residu: '#6b7280',
      b3: '#ef4444'
    };
    const fill = bgColors[kSlug] || '#2d6a4f';
    const initial = (itemNama || 'S').charAt(0).toUpperCase();

    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><rect width="160" height="120" fill="${encodeURIComponent(fill)}" rx="12"/><circle cx="80" cy="50" r="26" fill="white" opacity="0.25"/><text x="80" y="58" font-family="sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">${initial}</text><text x="80" y="98" font-family="sans-serif" font-size="11" fill="white" opacity="0.9" text-anchor="middle">${encodeURIComponent(itemNama)}</text></svg>`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-5 space-y-4">
      {/* Header Kategori */}
      <div className="flex items-center justify-between">
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${warna}`}>
            {badge}
          </span>
          <h3 className="font-bold text-stone-800 text-lg mt-1">{nama}</h3>
        </div>
      </div>

      <p className="text-sm text-stone-600 leading-relaxed">{deskripsi}</p>

      {/* Bagian Scroll Horizontal Kartu Gambar Jenis Sampah Sesuai task1.md */}
      <div>
        <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
          Daftar Jenis Sampah (Geser ke Samping →)
        </p>
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 hide-scrollbar">
          {items.map((item, idx) => {
            const imgSrc = getPlaceholderSvg(item.nama, slug);

            return (
              <div
                key={idx}
                className="shrink-0 w-36 bg-[#f7faf8] rounded-xl border border-stone-200 p-2.5 flex flex-col items-center text-center shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="w-full h-24 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center">
                  <img
                    src={imgSrc}
                    alt={item.nama}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-bold text-stone-800 mt-2 line-clamp-2 leading-tight">
                  {item.nama}
                </span>
                <span className="text-[10px] text-stone-600 mt-0.5 font-medium">
                  {badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
