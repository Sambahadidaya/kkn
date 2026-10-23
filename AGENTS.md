# INSTRUKSI UTAMA UNTUK AI AGENT (CODING ASSISTANT)

Kamu adalah AI Mobile&Web Developer Expert yang bertugas memprogram proyek "KKN Tematik Pengolahan Sampah".

---

## 1. KONDISI PROJECT SAAT INI (CONTEXT)

### A. Environment & Library Terinstal

Proyek ini menggunakan Next.js (App Router) berbasis JavaScript murni (bukan TypeScript). Dependencies berikut sudah diinstal sempurna:

```json
{
"dependencies": {
    "@fortawesome/fontawesome-free": "^7.3.1",
    "@supabase/ssr": "^0.12.7",
    "@supabase/supabase-js": "^2.118.0",
    "html5-qrcode": "^2.3.8",
    "jsqr": "^1.4.0",
    "lucide-react": "^1.61.0",
    "nanoid": "^6.0.2",
    "next": "16.4.2",
    "next-themes": "^0.4.6",
    "openai": "^7.42.0",
    "qrcode": "^1.5.4",
    "react": "19.3.0",
    "react-chartjs-2": "^5.3.1",
    "react-dom": "19.3.0",
    "react-image-crop": "^11.1.2",
    "react-markdown": "^10.1.0",
    "sharp": "^0.35.5",
    "xlsx": "^0.18.5"
  },
    "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "babel-plugin-react-compiler": "1.0.0",
    "tailwindcss": "^4"
  }
}
```

---

### B. Konfigurasi Database Supabase yang Sudah Aktif

```sql

-- ==============================================================================
-- SKEMA LENGKAP DATABASE SUPABASE - KPU PEMILU PRESMA POLITEKNIK LP3I
-- Jalankan skrip ini langsung di Supabase SQL Editor
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


```
### C. Struktur Folder Project Eksisting
```C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu
├── .gitignore
├── AGENTS.md
├── README.md
├── gabung.js
├── jsconfig.json
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
└── src
    ├── api
    │   ├── openai
    │   │   ├── aiAsisten.js
    │   │   ├── scankk.js
    │   │   └── scanktp.js
    │   └── supabase
    │       ├── admin
    │       │   ├── auth.js
    │       │   ├── roleakses.js
    │       │   └── trafik.js
    │       ├── public
    │       │   ├── auth.js
    │       │   ├── beranda.js
    │       │   ├── data.js
    │       │   ├── jadwal.js
    │       │   ├── login.js
    │       │   ├── profile.js
    │       │   ├── registrasi.js
    │       │   ├── riwayat.js
    │       │   ├── scan.js
    │       │   └── tambah.js
    │       └── storage.js
    ├── app
    │   ├── [nama]
    │   │   ├── beranda
    │   │   │   └── page.js
    │   │   ├── data
    │   │   │   └── page.js
    │   │   ├── edukasi
    │   │   │   └── page.js
    │   │   ├── jadwal
    │   │   │   └── page.js
    │   │   ├── pengaturan
    │   │   │   ├── keamanan
    │   │   │   │   └── page.js
    │   │   │   ├── kebijakanPrivasi
    │   │   │   │   └── page.js
    │   │   │   ├── kontak
    │   │   │   │   └── page.js
    │   │   │   ├── panduan
    │   │   │   │   └── page.js
    │   │   │   └── profil
    │   │   │       └── page.js
    │   │   ├── riwayat
    │   │   │   └── page.js
    │   │   └── tambah
    │   │       └── page.js
    │   ├── admin
    │   │   ├── akun
    │   │   │   └── page.js
    │   │   ├── dashboard
    │   │   │   └── page.js
    │   │   ├── edukasi
    │   │   │   └── page.js
    │   │   ├── login.js
    │   │   │   └── page.js
    │   │   └── role
    │   │       └── page.js
    │   ├── globals.css
    │   ├── layout.js
    │   ├── login
    │   │   └── page.js
    │   └── register
    │       └── page.js
    ├── assets
    │   ├── contoh
    │   │   └── desain
    │   │       └── tampilan.png
    │   ├── logo
    │   │   └── logo.png
    │   └── sampah
    │       ├── b3
    │       ├── nonorganik
    │       ├── organik
    │       └── residu
    ├── components
    │   ├── AiAsisten.js
    │   ├── DynamicFavicon.js
    │   ├── admin
    │   │   ├── card.js
    │   │   ├── footer.js
    │   │   ├── grafik.js
    │   │   └── header.js
    │   ├── animasi
    │   │   ├── SkeletonScreen.js
    │   │   ├── loadingBar.js
    │   │   ├── pulse.js
    │   │   └── spinner.js
    │   ├── grafik.js
    │   ├── modal.js
    │   ├── notifikasi.js
    │   ├── public
    │   │   ├── card.js
    │   │   ├── cardTutorial.js
    │   │   ├── footer.js
    │   │   ├── header.js
    │   │   └── profile.js
    │   ├── siteBackground.js
    │   ├── spinner.js
    │   ├── switch.js
    │   └── toggleTheme.js
    ├── data
    │   ├── panduan.js
    │   └── tutorial.js
    ├── lib
    │   ├── openai.js
    │   ├── roleData.js
    │   ├── siteTheme.js
    │   └── supabase.js
    ├── proxy.js
    ├── scurity
    │   ├── ratelimit.js
    │   ├── roleakses.js
    │   └── sanitaze.js
    └── utils
        ├── gdriveUtils.js
        ├── supabaseUtils.js
        └── youtubeUtils.js
```

## 2. ATURAN KODE

### 1. No TypeScript: Gunakan ES6 JavaScript murni (.js).
### 2. Gunakanlah Server Action jangan pakai RestAPI
### 3. Gunakanlah 'use client' dan 'use server' untuk memisahkan client dan server.
### 4. memakai tailwind sebagai css utama.
### 5. Untuk api semuanya dikumpulkan di src/api/ karna saya ingin pakai use server atau server action.

## 3. ATURAN PROJEK

### 1. Database memakai supabase. dan pakai supabaseUtils.js karna saya tidak ingin url atau link supabasenya langsung tereksport ke client tapi di atur dibackend yang use server
### 2. Deploy memakai vercel.
### 3. Video panduan memakai video youtube. dan pakai @youtubeUtils.js
### 4. pastikan web sudah responsif antara ukuran Desktop dan Mobile
### 5. untuk halaman '/[nama]/' tampilan mobile first (utamakan desain untuk mobile) dan juga responsive
### 6. untuk halaman '/admin/' tampilan desktop first (utamakan desain untuk desktop) dan juga responsive
### 7. untuk edukasi memakai video youtube atau google drive untuk kontennya dan pakai @driveUtils.js
### 8. tampilan desainnya jangan mencolok ai slopnya seperti hindarilah icon "spark" atau hidarilah banyak warna khususnya warna violet dan lain lainnya
### 9. untuk icon biasa pakai lucide-react dan untuk icon sosial media memakai fontawesome
