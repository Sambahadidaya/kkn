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
        darkBg: '#064e3b',
        text: '#065f46',
        darkText: '#a7f3d0',
        border: '#a7f3d0',
        darkBorder: '#047857',
        label: 'Sudah Memilah (+20 poin)'
      },
      sebagian: {
        bg: '#fef3c7',
        darkBg: '#78350f',
        text: '#92400e',
        darkText: '#fde68a',
        border: '#fde68a',
        darkBorder: '#b45309',
        label: 'Sebagian Memilah (+10 poin)'
      },
      belum: {
        bg: '#fee2e2',
        darkBg: '#7f1d1d',
        text: '#991b1b',
        darkText: '#fecaca',
        border: '#fecaca',
        darkBorder: '#b91c1c',
        label: 'Belum Memilah (0 poin)'
      }
    },
    kategori: {
      organik: {
        bg: '#ecfdf5',
        darkBg: '#064e3b',
        badge: '#10b981',
        text: '#064e3b',
        darkText: '#a7f3d0',
        border: '#a7f3d0',
        label: 'Organik'
      },
      nonorganik: {
        bg: '#eff6ff',
        darkBg: '#1e3a8a',
        badge: '#3b82f6',
        text: '#1e3a8a',
        darkText: '#bfdbfe',
        border: '#bfdbfe',
        label: 'Non-Organik'
      },
      residu: {
        bg: '#f3f4f6',
        darkBg: '#374151',
        badge: '#6b7280',
        text: '#1f2937',
        darkText: '#e5e7eb',
        border: '#e5e7eb',
        label: 'Residu'
      },
      b3: {
        bg: '#fff1f2',
        darkBg: '#881337',
        badge: '#ef4444',
        text: '#881337',
        darkText: '#fecdd3',
        border: '#fecdd3',
        label: 'B3 (Berbahaya)'
      }
    }
  }
};

export default siteTheme;
