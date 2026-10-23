// Konfigurasi Role dan Menu Navigasi Sesuai Spesifikasi task1.md

export const ROLES = {
  WARGA: 'warga',
  PETUGAS: 'petugas',
  RT: 'rt',
  RW: 'rw',
  KELURAHAN: 'kelurahan',
  ADMIN: 'admin'
};

export const ROLE_INFO = {
  warga: {
    nama: 'Warga',
    deskripsi: 'Masyarakat pengelola sampah rumah tangga mandiri',
    slug: 'warga',
    navigasi: [
      { id: 'beranda', label: 'Beranda', href: '/warga/beranda', icon: 'Home' },
      { id: 'edukasi', label: 'Edukasi', href: '/warga/edukasi', icon: 'BookOpen' },
      { id: 'jadwal', label: 'Jadwal', href: '/warga/jadwal', icon: 'Calendar' },
      { id: 'riwayat', label: 'Riwayat', href: '/warga/riwayat', icon: 'Clock' },
      { id: 'peringkat', label: 'Peringkat', href: '/warga/peringkat', icon: 'Trophy' },
      { id: 'pengaturan', label: 'Pengaturan', href: '/warga/pengaturan/profil', icon: 'Settings' }
    ]
  },
  petugas: {
    nama: 'Petugas Pengambil',
    deskripsi: 'Petugas patroli dan pencatatan sampah lingkungan',
    slug: 'petugas',
    navigasi: [
      { id: 'beranda', label: 'Beranda', href: '/petugas/beranda', icon: 'Home' },
      { id: 'tambah', label: 'Tambah Sampah', href: '/petugas/tambah', icon: 'PlusCircle' },
      { id: 'jadwal', label: 'Jadwal Patroli', href: '/petugas/jadwal', icon: 'Calendar' },
      { id: 'riwayat', label: 'Riwayat', href: '/petugas/riwayat', icon: 'Clock' },
      { id: 'pengaturan', label: 'Pengaturan', href: '/petugas/pengaturan/profil', icon: 'Settings' }
    ]
  },
  rt: {
    nama: 'Rukun Tetangga (RT)',
    deskripsi: 'Pengawas data warga dan capaian pemilahan tingkat RT',
    slug: 'rt',
    navigasi: [
      { id: 'beranda', label: 'Beranda', href: '/rt/beranda', icon: 'Home' },
      { id: 'jadwal', label: 'Jadwal', href: '/rt/jadwal', icon: 'Calendar' },
      { id: 'peringkat', label: 'Peringkat', href: '/rt/peringkat', icon: 'Trophy' },
      { id: 'data', label: 'Data Warga', href: '/rt/data', icon: 'Users' },
      { id: 'pengaturan', label: 'Pengaturan', href: '/rt/pengaturan/profil', icon: 'Settings' }
    ]
  },
  rw: {
    nama: 'Rukun Warga (RW)',
    deskripsi: 'Monitoring statistik pemilahan sampah lintas RT',
    slug: 'rw',
    navigasi: [
      { id: 'beranda', label: 'Beranda', href: '/rw/beranda', icon: 'Home' },
      { id: 'edukasi', label: 'Edukasi', href: '/rw/edukasi', icon: 'BookOpen' },
      { id: 'jadwal', label: 'Jadwal', href: '/rw/jadwal', icon: 'Calendar' },
      { id: 'data', label: 'Data RT', href: '/rw/data', icon: 'Building2' },
      { id: 'peringkat', label: 'Peringkat', href: '/rw/peringkat', icon: 'Trophy' },
      { id: 'pengaturan', label: 'Pengaturan', href: '/rw/pengaturan/profil', icon: 'Settings' }
    ]
  },
  kelurahan: {
    nama: 'Kelurahan',
    deskripsi: 'Pimpinan dan pengawas agregat sampah tingkat kelurahan',
    slug: 'kelurahan',
    navigasi: [
      { id: 'beranda', label: 'Beranda', href: '/kelurahan/beranda', icon: 'Home' },
      { id: 'edukasi', label: 'Edukasi', href: '/kelurahan/edukasi', icon: 'BookOpen' },
      { id: 'jadwal', label: 'Jadwal', href: '/kelurahan/jadwal', icon: 'Calendar' },
      { id: 'data', label: 'Data RT & RW', href: '/kelurahan/data', icon: 'Building' },
      { id: 'peringkat', label: 'Peringkat', href: '/kelurahan/peringkat', icon: 'Trophy' },
      { id: 'pengaturan', label: 'Pengaturan', href: '/kelurahan/pengaturan/profil', icon: 'Settings' }
    ]
  },
  admin: {
    nama: 'Administrator',
    deskripsi: 'Pengelola akun aparatur, role, edukasi, dan sistem AI',
    slug: 'admin',
    navigasi: [
      { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
      { id: 'akun', label: 'Kelola Akun', href: '/admin/akun', icon: 'UserCheck' },
      { id: 'role', label: 'Role & Akses', href: '/admin/role', icon: 'ShieldCheck' },
      { id: 'edukasi', label: 'Kelola Edukasi', href: '/admin/edukasi', icon: 'Film' },
      { id: 'ai', label: 'Konfigurasi AI', href: '/admin/ai', icon: 'Bot' }
    ]
  }
};

export function isValidRole(role) {
  return Boolean(role && ROLE_INFO[role.toLowerCase()]);
}

export function getRoleNav(role) {
  const info = ROLE_INFO[role?.toLowerCase()];
  return info ? info.navigasi : [];
}
