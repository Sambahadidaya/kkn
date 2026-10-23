// Konfigurasi Tema dan Skema Warna KKN Pengolahan Sampah
// Nuansa: Hijau Hutan / Emerald & Netral Alami, Aksesibel & Kontras Tinggi (Ramah Usia 40+)

export const siteTheme = {
  name: 'KKN Tematik Pengolahan Sampah',
  colors: {
    primary: {
      DEFAULT: '#2d6a4f',
      dark: '#1b4332',
      light: '#40916c',
      subtle: '#d8f3dc',
      surface: '#eef8f2'
    },
    secondary: {
      DEFAULT: '#22577a',
      light: '#38a3a5',
      surface: '#eaf4f4'
    },
    status: {
      sudah: {
        bg: '#d1fae5',
        text: '#065f46',
        border: '#a7f3d0',
        label: 'Sudah Memilah (+20 poin)'
      },
      sebagian: {
        bg: '#fef3c7',
        text: '#92400e',
        border: '#fde68a',
        label: 'Sebagian Memilah (+10 poin)'
      },
      belum: {
        bg: '#fee2e2',
        text: '#991b1b',
        border: '#fecaca',
        label: 'Belum Memilah (0 poin)'
      }
    },
    kategori: {
      organik: {
        bg: '#ecfdf5',
        badge: '#10b981',
        text: '#064e3b',
        border: '#a7f3d0',
        label: 'Organik'
      },
      nonorganik: {
        bg: '#eff6ff',
        badge: '#3b82f6',
        text: '#1e3a8a',
        border: '#bfdbfe',
        label: 'Non-Organik'
      },
      residu: {
        bg: '#f3f4f6',
        badge: '#6b7280',
        text: '#1f2937',
        border: '#e5e7eb',
        label: 'Residu'
      },
      b3: {
        bg: '#fff1f2',
        badge: '#ef4444',
        text: '#881337',
        border: '#fecdd3',
        label: 'B3 (Berbahaya)'
      }
    }
  }
};

export default siteTheme;
