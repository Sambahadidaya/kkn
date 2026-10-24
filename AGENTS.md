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

-- ============================================================
-- KKN SAMPAH – SKEMA DATABASE
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------- ENUM ----------
do $$ begin
  create type user_role as enum ('warga','petugas','rt','rw','kelurahan','admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type status_pilah as enum ('sudah','sebagian','belum');
exception when duplicate_object then null; end $$;
do $$ begin
  create type status_request as enum ('pending','disetujui','ditolak');
exception when duplicate_object then null; end $$;
do $$ begin
  create type status_jadwal as enum ('terjadwal','berlangsung','selesai','batal');
exception when duplicate_object then null; end $$;

-- ---------- WILAYAH ----------
create table if not exists rw (
  id uuid primary key default uuid_generate_v4(),
  nomor int not null unique,
  kelurahan text not null default 'Kelurahan',
  created_at timestamptz not null default now()
);

create table if not exists rt (
  id uuid primary key default uuid_generate_v4(),
  rw_id uuid not null references rw(id) on delete cascade,
  nomor int not null,
  created_at timestamptz not null default now(),
  unique (rw_id, nomor)
);

-- ---------- PROFIL ----------
-- id = auth.users.id
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  nama text not null,
  email text not null unique,
  no_telepon text not null unique,
  role user_role not null default 'warga',
  rt_id uuid references rt(id) on delete set null,
  rw_id uuid references rw(id) on delete set null,
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_rt on profiles(rt_id);

-- ---------- RUMAH (QR berisi rumah.id saja) ----------
create table if not exists rumah (
  id uuid primary key default uuid_generate_v4(),
  rt_id uuid not null references rt(id) on delete cascade,
  nomor_rumah text not null,
  warga_id uuid unique references profiles(id) on delete set null,
  status_pilah_terakhir status_pilah,
  created_at timestamptz not null default now(),
  unique (rt_id, nomor_rumah)
);
create index if not exists idx_rumah_warga on rumah(warga_id);

-- ---------- KTP (terenkripsi AES-256-GCM di server) ----------
create table if not exists ktp_data (
  user_id uuid primary key references profiles(id) on delete cascade,
  nik_hash text unique,          -- HMAC(NIK) untuk cek duplikat
  nik_enc text,
  nama_enc text,
  alamat_enc text,
  tempat_lahir_enc text,
  tanggal_lahir_enc text,
  jenis_kelamin_enc text,
  pekerjaan_enc text,
  detail_enc text,               -- JSON terenkripsi (agama, status, kewarganegaraan, dll)
  foto_path text,                -- path di bucket privat 'ktp'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PERMINTAAN AKSES DATA ----------
create table if not exists data_access_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references profiles(id) on delete cascade,
  alasan text,
  status status_request not null default 'pending',
  approved_by uuid references profiles(id) on delete set null,
  decided_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_dar_requester on data_access_requests(requester_id);

-- ---------- KATEGORI & JENIS SAMPAH ----------
create table if not exists kategori_sampah (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  nama text not null,
  deskripsi text,
  urutan int not null default 0
);

create table if not exists jenis_sampah (
  id uuid primary key default uuid_generate_v4(),
  kategori_id uuid not null references kategori_sampah(id) on delete cascade,
  nama text not null,
  deskripsi text,
  gambar text,                   -- path placeholder, mis. /assets/sampah/organik/sisa-makanan.png
  created_at timestamptz not null default now()
);

create table if not exists edukasi_video (
  id uuid primary key default uuid_generate_v4(),
  judul text not null,
  deskripsi text,
  tipe text not null check (tipe in ('youtube','gdrive')),
  url text not null,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- JADWAL PATROLI (publik: SELECT true) ----------
create table if not exists jadwal_patroli (
  id uuid primary key default uuid_generate_v4(),
  tanggal date not null,
  jam_mulai time not null,
  jam_selesai time,
  petugas_id uuid references profiles(id) on delete set null,
  catatan text,
  status status_jadwal not null default 'terjadwal',
  dibuat_oleh uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_jadwal_tanggal on jadwal_patroli(tanggal);

create table if not exists jadwal_patroli_rt (
  jadwal_id uuid not null references jadwal_patroli(id) on delete cascade,
  rt_id uuid not null references rt(id) on delete cascade,
  primary key (jadwal_id, rt_id)
);

-- ---------- SETORAN / RIWAYAT ----------
create table if not exists setoran_sampah (
  id uuid primary key default uuid_generate_v4(),
  rumah_id uuid not null references rumah(id) on delete cascade,
  warga_id uuid not null references profiles(id) on delete cascade,
  petugas_id uuid not null references profiles(id) on delete restrict,
  jadwal_id uuid references jadwal_patroli(id) on delete set null,
  tanggal date not null default current_date,
  status_pilah status_pilah not null,
  poin int not null default 0,   -- diisi trigger: sudah=20, sebagian=10, belum=0
  catatan text,
  created_at timestamptz not null default now()
);
create index if not exists idx_setoran_warga on setoran_sampah(warga_id);
create index if not exists idx_setoran_petugas on setoran_sampah(petugas_id);

create table if not exists setoran_item (
  id uuid primary key default uuid_generate_v4(),
  setoran_id uuid not null references setoran_sampah(id) on delete cascade,
  kategori_id uuid not null references kategori_sampah(id),
  jenis_id uuid references jenis_sampah(id),
  berat_kg numeric(8,2) not null check (berat_kg >= 0)
);
create index if not exists idx_item_setoran on setoran_item(setoran_id);

-- ---------- PERINGKAT (publik: SELECT true, ditulis trigger saja) ----------
create table if not exists peringkat (
  warga_id uuid primary key references profiles(id) on delete cascade,
  nama_tampil text not null,
  rt_id uuid references rt(id) on delete set null,
  total_poin int not null default 0,
  total_kg numeric(10,2) not null default 0,
  jumlah_setoran int not null default 0,
  status_pilah_terakhir status_pilah,
  updated_at timestamptz not null default now()
);
create index if not exists idx_peringkat_poin on peringkat(total_poin desc);
create index if not exists idx_peringkat_kg on peringkat(total_kg desc);

create table if not exists peringkat_kategori (
  warga_id uuid not null references profiles(id) on delete cascade,
  kategori_id uuid not null references kategori_sampah(id) on delete cascade,
  total_kg numeric(10,2) not null default 0,
  primary key (warga_id, kategori_id)
);

-- ---------- KONFIGURASI AI (diatur admin) ----------
create table if not exists ai_config (
  id int primary key default 1 check (id = 1),
  model_ocr text not null default 'gpt-4o-mini',
  model_asisten text not null default 'gpt-4o-mini',
  system_prompt_asisten text not null default 'Kamu asisten edukasi pengelolaan sampah rumah tangga. Jawab singkat, jelas, dan ramah dalam Bahasa Indonesia.',
  prompt_ocr_ktp text not null default 'Ekstrak data KTP Indonesia menjadi JSON: nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, rt_rw, kel_desa, kecamatan, agama, status_perkawinan, pekerjaan, kewarganegaraan. Jika tidak terbaca isi null.',
  asisten_aktif boolean not null default true,
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into ai_config (id) values (1) on conflict do nothing;

-- ---------- TRAFIK ----------
create table if not exists trafik_log (
  id bigserial primary key,
  path text not null,
  role user_role,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FUNGSI BANTU (SECURITY DEFINER agar tidak rekursif di RLS)
-- ============================================================
create or replace function auth_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid() and aktif
$$;

create or replace function auth_rt_id() returns uuid
language sql stable security definer set search_path = public as $$
  select rt_id from profiles where id = auth.uid()
$$;

create or replace function auth_rw_id() returns uuid
language sql stable security definer set search_path = public as $$
  select rw_id from profiles where id = auth.uid()
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() = 'admin', false)
$$;

-- warga target berada di RT yang sama dengan user (khusus role rt)
create or replace function rt_boleh_akses(target uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() = 'rt' and exists (
    select 1 from profiles p
    where p.id = target and p.rt_id is not null and p.rt_id = auth_rt_id()
  ), false)
$$;

-- ============================================================
-- TRIGGER
-- ============================================================
create or replace function set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_profiles_upd on profiles;
create trigger trg_profiles_upd before update on profiles
  for each row execute function set_updated_at();
drop trigger if exists trg_ktp_upd on ktp_data;
create trigger trg_ktp_upd before update on ktp_data
  for each row execute function set_updated_at();

-- cegah user biasa mengubah role / wilayah / status sendiri
create or replace function guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_admin() then
    if new.role <> old.role or new.rt_id is distinct from old.rt_id
       or new.rw_id is distinct from old.rw_id or new.aktif <> old.aktif then
      raise exception 'Perubahan role/wilayah hanya oleh admin';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_profile on profiles;
create trigger trg_guard_profile before update on profiles
  for each row execute function guard_profile_update();

-- poin: sudah=20, sebagian=10, belum=0
create or replace function hitung_poin() returns trigger
language plpgsql as $$
begin
  new.poin := case new.status_pilah
    when 'sudah' then 20 when 'sebagian' then 10 else 0 end;
  return new;
end $$;
drop trigger if exists trg_hitung_poin on setoran_sampah;
create trigger trg_hitung_poin before insert or update of status_pilah on setoran_sampah
  for each row execute function hitung_poin();

-- hitung ulang peringkat satu warga
create or replace function recalc_peringkat(p_warga uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_nama text; v_rt uuid; v_poin int; v_cnt int; v_kg numeric; v_last status_pilah;
begin
  select nama, rt_id into v_nama, v_rt from profiles where id = p_warga;
  if v_nama is null then return; end if;

  select coalesce(sum(poin),0), count(*) into v_poin, v_cnt
    from setoran_sampah where warga_id = p_warga;
  select coalesce(sum(i.berat_kg),0) into v_kg
    from setoran_item i join setoran_sampah s on s.id = i.setoran_id
    where s.warga_id = p_warga;
  select status_pilah into v_last from setoran_sampah
    where warga_id = p_warga order by tanggal desc, created_at desc limit 1;

  insert into peringkat (warga_id, nama_tampil, rt_id, total_poin, total_kg,
                         jumlah_setoran, status_pilah_terakhir, updated_at)
  values (p_warga, v_nama, v_rt, v_poin, v_kg, v_cnt, v_last, now())
  on conflict (warga_id) do update set
    nama_tampil = excluded.nama_tampil, rt_id = excluded.rt_id,
    total_poin = excluded.total_poin, total_kg = excluded.total_kg,
    jumlah_setoran = excluded.jumlah_setoran,
    status_pilah_terakhir = excluded.status_pilah_terakhir,
    updated_at = now();

  delete from peringkat_kategori where warga_id = p_warga;
  insert into peringkat_kategori (warga_id, kategori_id, total_kg)
    select s.warga_id, i.kategori_id, sum(i.berat_kg)
    from setoran_item i join setoran_sampah s on s.id = i.setoran_id
    where s.warga_id = p_warga group by s.warga_id, i.kategori_id;

  update rumah set status_pilah_terakhir = v_last where warga_id = p_warga;
end $$;

create or replace function trg_setoran_recalc() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform recalc_peringkat(coalesce(new.warga_id, old.warga_id));
  return null;
end $$;
drop trigger if exists trg_setoran_after on setoran_sampah;
create trigger trg_setoran_after after insert or update or delete on setoran_sampah
  for each row execute function trg_setoran_recalc();

create or replace function trg_item_recalc() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_warga uuid;
begin
  select warga_id into v_warga from setoran_sampah
    where id = coalesce(new.setoran_id, old.setoran_id);
  if v_warga is not null then perform recalc_peringkat(v_warga); end if;
  return null;
end $$;
drop trigger if exists trg_item_after on setoran_item;
create trigger trg_item_after after insert or update or delete on setoran_item
  for each row execute function trg_item_recalc();

-- ============================================================
-- FUNGSI RPC UNTUK ROLE TERBATAS
-- ============================================================
-- Petugas: cari rumah by nama / nomor rumah (tanpa detail KTP)
create or replace function cari_rumah(q text)
returns table (rumah_id uuid, nomor_rumah text, rt_nomor int, rw_nomor int,
               warga_id uuid, nama text, status_pilah_terakhir status_pilah)
language sql stable security definer set search_path = public as $$
  select r.id, r.nomor_rumah, t.nomor, w.nomor, p.id, p.nama, r.status_pilah_terakhir
  from rumah r
  join rt t on t.id = r.rt_id
  join rw w on w.id = t.rw_id
  left join profiles p on p.id = r.warga_id
  where auth_role() in ('petugas','admin')
    and (p.nama ilike '%'||q||'%' or r.nomor_rumah ilike '%'||q||'%')
  order by p.nama limit 20
$$;

-- Petugas: resolve QR (rumah.id)
create or replace function rumah_by_id(p_id uuid)
returns table (rumah_id uuid, nomor_rumah text, rt_nomor int, rw_nomor int,
               warga_id uuid, nama text)
language sql stable security definer set search_path = public as $$
  select r.id, r.nomor_rumah, t.nomor, w.nomor, p.id, p.nama
  from rumah r join rt t on t.id = r.rt_id join rw w on w.id = t.rw_id
  left join profiles p on p.id = r.warga_id
  where auth_role() in ('petugas','admin') and r.id = p_id
$$;

-- RW & Kelurahan: HANYA angka total (tanpa detail warga)
create or replace function rekap_rt()
returns table (rt_id uuid, rw_nomor int, rt_nomor int, jumlah_warga bigint,
               total_kg numeric, total_poin bigint)
language sql stable security definer set search_path = public as $$
  select t.id, w.nomor, t.nomor,
         (select count(*) from profiles p where p.rt_id = t.id and p.role = 'warga'),
         coalesce((select sum(pr.total_kg) from peringkat pr where pr.rt_id = t.id),0),
         coalesce((select sum(pr.total_poin) from peringkat pr where pr.rt_id = t.id),0)
  from rt t join rw w on w.id = t.rw_id
  where auth_role() in ('rw','kelurahan','admin')
    and (auth_role() <> 'rw' or t.rw_id = auth_rw_id())
  order by w.nomor, t.nomor
$$;

create or replace function rekap_rw()
returns table (rw_id uuid, rw_nomor int, jumlah_rt bigint, jumlah_warga bigint,
               total_kg numeric)
language sql stable security definer set search_path = public as $$
  select w.id, w.nomor,
         (select count(*) from rt t where t.rw_id = w.id),
         (select count(*) from profiles p where p.rw_id = w.id and p.role = 'warga'),
         coalesce((select sum(pr.total_kg) from peringkat pr
                   join rt t on t.id = pr.rt_id where t.rw_id = w.id),0)
  from rw w
  where auth_role() in ('kelurahan','admin')
  order by w.nomor
$$;

-- Apakah warga punya persetujuan aktif untuk melihat data sendiri
create or replace function punya_akses_data(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from data_access_requests
    where requester_id = p_user and status = 'disetujui'
      and (expires_at is null or expires_at > now())
  )
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table rw enable row level security;
alter table rt enable row level security;
alter table profiles enable row level security;
alter table rumah enable row level security;
alter table ktp_data enable row level security;
alter table data_access_requests enable row level security;
alter table kategori_sampah enable row level security;
alter table jenis_sampah enable row level security;
alter table edukasi_video enable row level security;
alter table jadwal_patroli enable row level security;
alter table jadwal_patroli_rt enable row level security;
alter table setoran_sampah enable row level security;
alter table setoran_item enable row level security;
alter table peringkat enable row level security;
alter table peringkat_kategori enable row level security;
alter table ai_config enable row level security;
alter table trafik_log enable row level security;

-- ---- RW / RT: baca publik (dibutuhkan form registrasi & tampilan), tulis admin ----
create policy rw_select on rw for select using (true);
create policy rw_admin on rw for all using (is_admin()) with check (is_admin());
create policy rt_select on rt for select using (true);
create policy rt_admin on rt for all using (is_admin()) with check (is_admin());

-- ---- PROFILES ----
create policy profiles_self_select on profiles for select
  using (id = auth.uid());
create policy profiles_rt_select on profiles for select
  using (rt_boleh_akses(id));
create policy profiles_admin_all on profiles for all
  using (is_admin()) with check (is_admin());
create policy profiles_self_update on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_rt_update on profiles for update
  using (rt_boleh_akses(id)) with check (rt_boleh_akses(id));
-- INSERT akun baru dilakukan server (service role) saat Submit registrasi

-- ---- RUMAH ----
create policy rumah_self_select on rumah for select using (warga_id = auth.uid());
create policy rumah_rt_select on rumah for select
  using (auth_role() = 'rt' and rt_id = auth_rt_id());
create policy rumah_petugas_select on rumah for select
  using (auth_role() = 'petugas');
create policy rumah_admin_all on rumah for all
  using (is_admin()) with check (is_admin());

-- ---- KTP (ciphertext; dekripsi hanya di server) ----
create policy ktp_self_select on ktp_data for select using (user_id = auth.uid());
create policy ktp_rt_select on ktp_data for select using (rt_boleh_akses(user_id));
create policy ktp_rt_update on ktp_data for update
  using (rt_boleh_akses(user_id)) with check (rt_boleh_akses(user_id));
create policy ktp_admin_all on ktp_data for all
  using (is_admin()) with check (is_admin());
-- RW & Kelurahan: tidak ada policy = tidak bisa akses

-- ---- PERMINTAAN AKSES DATA ----
create policy dar_self_select on data_access_requests for select
  using (requester_id = auth.uid());
create policy dar_self_insert on data_access_requests for insert
  with check (requester_id = auth.uid() and status = 'pending');
create policy dar_approver_select on data_access_requests for select
  using (auth_role() in ('rt','rw','kelurahan','admin'));
create policy dar_approver_update on data_access_requests for update
  using (auth_role() in ('rt','rw','kelurahan','admin'))
  with check (auth_role() in ('rt','rw','kelurahan','admin'));

-- ---- KATEGORI / JENIS / EDUKASI: baca publik, tulis admin ----
create policy kategori_select on kategori_sampah for select using (true);
create policy kategori_admin on kategori_sampah for all
  using (is_admin()) with check (is_admin());
create policy jenis_select on jenis_sampah for select using (true);
create policy jenis_admin on jenis_sampah for all
  using (is_admin()) with check (is_admin());
create policy edukasi_select on edukasi_video for select using (aktif or is_admin());
create policy edukasi_admin on edukasi_video for all
  using (is_admin()) with check (is_admin());

-- ---- JADWAL PATROLI: SELECT true, CRUD petugas/admin ----
create policy jadwal_select on jadwal_patroli for select using (true);
create policy jadwal_crud_ins on jadwal_patroli for insert
  with check (auth_role() in ('petugas','admin'));
create policy jadwal_crud_upd on jadwal_patroli for update
  using (auth_role() in ('petugas','admin')) with check (auth_role() in ('petugas','admin'));
create policy jadwal_crud_del on jadwal_patroli for delete
  using (auth_role() in ('petugas','admin'));

create policy jadwal_rt_select on jadwal_patroli_rt for select using (true);
create policy jadwal_rt_ins on jadwal_patroli_rt for insert
  with check (auth_role() in ('petugas','admin'));
create policy jadwal_rt_upd on jadwal_patroli_rt for update
  using (auth_role() in ('petugas','admin')) with check (auth_role() in ('petugas','admin'));
create policy jadwal_rt_del on jadwal_patroli_rt for delete
  using (auth_role() in ('petugas','admin'));

-- ---- SETORAN / RIWAYAT ----
create policy setoran_warga_select on setoran_sampah for select
  using (warga_id = auth.uid());
create policy setoran_rt_select on setoran_sampah for select
  using (rt_boleh_akses(warga_id));
create policy setoran_petugas_select on setoran_sampah for select
  using (auth_role() = 'petugas');
create policy setoran_petugas_ins on setoran_sampah for insert
  with check (auth_role() = 'petugas' and petugas_id = auth.uid());
create policy setoran_petugas_upd on setoran_sampah for update
  using (auth_role() = 'petugas' and petugas_id = auth.uid())
  with check (auth_role() = 'petugas' and petugas_id = auth.uid());
create policy setoran_admin_all on setoran_sampah for all
  using (is_admin()) with check (is_admin());

create policy item_select on setoran_item for select using (
  exists (select 1 from setoran_sampah s where s.id = setoran_id and (
    s.warga_id = auth.uid() or rt_boleh_akses(s.warga_id)
    or auth_role() = 'petugas' or is_admin())));
create policy item_petugas_ins on setoran_item for insert with check (
  auth_role() = 'petugas' and exists (
    select 1 from setoran_sampah s where s.id = setoran_id and s.petugas_id = auth.uid()));
create policy item_petugas_upd on setoran_item for update
  using (exists (select 1 from setoran_sampah s where s.id = setoran_id
         and s.petugas_id = auth.uid() and auth_role() = 'petugas'));
create policy item_admin_all on setoran_item for all
  using (is_admin()) with check (is_admin());

-- ---- PERINGKAT: SELECT true; tidak ada policy tulis (hanya trigger) ----
create policy peringkat_select on peringkat for select using (true);
create policy peringkat_kat_select on peringkat_kategori for select using (true);

-- ---- AI CONFIG: hanya admin (server membaca via service role) ----
create policy ai_admin on ai_config for all using (is_admin()) with check (is_admin());

-- ---- TRAFIK ----
create policy trafik_insert on trafik_log for insert with check (true);
create policy trafik_admin_select on trafik_log for select using (is_admin());

-- ============================================================
-- STORAGE: bucket privat untuk foto KTP (akses hanya via service role)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('ktp', 'ktp', false) on conflict (id) do nothing;
-- Tanpa policy storage.objects untuk bucket 'ktp' = ditolak untuk anon/authenticated.

-- ============================================================
-- SEED
-- ============================================================
insert into kategori_sampah (slug, nama, deskripsi, urutan) values
 ('organik','Organik','Sampah mudah membusuk dari sisa makhluk hidup',1),
 ('nonorganik','Non-Organik','Sampah yang dapat didaur ulang',2),
 ('residu','Residu','Sampah yang sulit didaur ulang',3),
 ('b3','B3','Sampah berbahaya dan beracun',4)
on conflict (slug) do nothing;

insert into jenis_sampah (kategori_id, nama, deskripsi, gambar)
select k.id, v.nama, v.deskripsi, '/assets/sampah/'||k.slug||'/placeholder.png'
from (values
 ('organik','Sisa Makanan','Nasi, sayur, buah sisa'),
 ('organik','Daun & Ranting','Sampah kebun'),
 ('nonorganik','Botol Plastik','Botol minuman plastik'),
 ('nonorganik','Kertas & Kardus','Kertas bekas, kardus'),
 ('nonorganik','Kaleng','Kaleng minuman/makanan'),
 ('residu','Popok & Pembalut','Sulit didaur ulang'),
 ('residu','Styrofoam','Kemasan styrofoam'),
 ('b3','Baterai','Baterai bekas'),
 ('b3','Lampu','Lampu neon/LED bekas')
) as v(slug, nama, deskripsi)
join kategori_sampah k on k.slug = v.slug;

-- Contoh wilayah awal (ubah sesuai kebutuhan)
-- insert into rw (nomor, kelurahan) values (1, 'Nama Kelurahan');
-- insert into rt (rw_id, nomor) select id, 1 from rw where nomor = 1;

-- ============================================================
-- ADMIN PERTAMA (manual)
-- 1) Buat user di Supabase Auth (Authentication > Users)
-- 2) Jalankan, ganti UUID & data:
insert into profiles (id, username, nama, email, no_telepon, role)
values ('45e9642b-9c4c-4d77-ae22-43082a8f1f7a', 'admin', 'Administrator', 'admin@gmail.com', '0800000000', 'admin');
-- ============================================================

```
### C. Struktur Folder Project Eksisting
```C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu
├── .env.local
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
    │       │   ├── ai.js
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
    │   │   ├── layout.js
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
    │   │   ├── peringkat
    │   │   │   └── page.js
    │   │   ├── riwayat
    │   │   │   └── page.js
    │   │   └── tambah
    │   │       └── page.js
    │   ├── admin
    │   │   ├── ai
    │   │   │   └── page.js
    │   │   ├── akun
    │   │   │   └── page.js
    │   │   ├── dashboard
    │   │   │   └── page.js
    │   │   ├── edukasi
    │   │   │   └── page.js
    │   │   ├── layout.js
    │   │   ├── login
    │   │   │   └── page.js
    │   │   └── role
    │   │       └── page.js
    │   ├── globals.css
    │   ├── layout.js
    │   ├── login
    │   │   └── page.js
    │   ├── page.js
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
    │   │   ├── AdminGuard.js
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
    │   ├── crypto.js
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
