// Tutorial Video & Materi Edukasi Pengolahan Sampah Lingkungan

export const TUTORIAL_VIDEOS = [
  {
    id: '1',
    judul: 'Video Tutorial: Memilah Sampah Rumah Tangga dengan Mudah',
    deskripsi: 'Video pengantar sederhana tentang cara memisahkan sampah organik dan daur ulang untuk keluarga.',
    tipe: 'youtube',
    url: 'https://www.youtube.com/watch?v=1u_uU4n1Z3g' // Video edukasi ramah publik
  },
  {
    id: '2',
    judul: 'Membuat Kompos Sederhana Menggunakan Ember Bekas',
    deskripsi: 'Manfaatkan sisa sayur dan buah dapur menjadi pupuk tanaman subur di pekarangan rumah.',
    tipe: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
];

export const KATEGORI_SAMPAH_INFO = [
  {
    slug: 'organik',
    nama: 'Sampah Organik',
    warna: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    badge: 'Organik',
    deskripsi: 'Sampah alami yang mudah membusuk dan dapat diolah menjadi kompos.',
    contoh: ['Sisa makanan', 'Sayur busuk', 'Kulit buah', 'Daun & ranting kering', 'Ampas kopi/teh'],
    items: [
      { nama: 'Sisa Makanan', file: 'sisa_makanan.png' },
      { nama: 'Sayur & Buah', file: 'sayuran.png' },
      { nama: 'Daun Kering', file: 'daun.png' },
      { nama: 'Ampas Kopi', file: 'kopi.png' }
    ]
  },
  {
    slug: 'nonorganik',
    nama: 'Sampah Non-Organik (Daur Ulang)',
    warna: 'bg-blue-50 text-blue-800 border-blue-300',
    badge: 'Non-Organik',
    deskripsi: 'Sampah anorganik bernilai ekonomis yang bisa didaur ulang atau dijual ke bank sampah.',
    contoh: ['Botol plastik (PET)', 'Kardus & kertas', 'Kaleng minuman', 'Tutup botol', 'Plastik bening'],
    items: [
      { nama: 'Botol Plastik', file: 'botol.png' },
      { nama: 'Kardus & Kertas', file: 'kardus.png' },
      { nama: 'Kaleng Minuman', file: 'kaleng.png' },
      { nama: 'Gelas Plastik', file: 'gelas.png' }
    ]
  },
  {
    slug: 'residu',
    nama: 'Sampah Residu',
    warna: 'bg-stone-50 text-stone-800 border-stone-300',
    badge: 'Residu',
    deskripsi: 'Sampah yang belum memiliki nilai daur ulang saat ini dan harus dibuang ke TPA.',
    contoh: ['Popok sekali pakai', 'Puntung rokok', 'Styrofoam', 'Tisu kotor', 'Plastik sachet permen'],
    items: [
      { nama: 'Popok Bayi/Dewasa', file: 'popok.png' },
      { nama: 'Styrofoam', file: 'styrofoam.png' },
      { nama: 'Plastik Sachet', file: 'sachet.png' }
    ]
  },
  {
    slug: 'b3',
    nama: 'Sampah Bahan Berbahaya & Beracun (B3)',
    warna: 'bg-rose-50 text-rose-800 border-rose-300',
    badge: 'B3',
    deskripsi: 'Sampah yang mengandung zat berbahaya bagi kesehatan dan lingkungan jika dibuang sembarangan.',
    contoh: ['Baterai bekas', 'Lampu neon pecah', 'Botol pestisida/obat', 'Pernis/cat', 'Termometer air raksa'],
    items: [
      { nama: 'Baterai Bekas', file: 'baterai.png' },
      { nama: 'Lampu Bekas', file: 'lampu.png' },
      { nama: 'Kemasan Racun/Obat', file: 'obat.png' }
    ]
  }
];
