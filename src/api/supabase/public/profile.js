'use server';

// Server Action untuk Pengaturan Profil, Papan Peringkat (Leaderboard), dan Ubah Kata Sandi
import { getSupabaseServiceClient, getSupabaseServerClient } from '../../../utils/supabaseUtils';
import { getCurrentUserProfile } from '../../../scurity/roleakses';
import { sanitizePhone, sanitizeString } from '../../../scurity/sanitaze';

export async function getProfileDetailAction() {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return { success: false, error: 'Belum login' };

    const service = getSupabaseServiceClient();

    // Ambil data rumah jika ada
    const { data: rumah } = await service
      .from('rumah')
      .select('id, nomor_rumah, status_pilah_terakhir')
      .eq('warga_id', profile.id)
      .maybeSingle();

    return {
      success: true,
      profile: {
        ...profile,
        rumah
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateProfilePengaturanAction({ nama, noTelepon, passwordBaru }) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return { success: false, error: 'Belum login' };

    const service = getSupabaseServiceClient();
    const updateData = {};

    if (nama) updateData.nama = sanitizeString(nama, 100);
    if (noTelepon) updateData.no_telepon = sanitizePhone(noTelepon);

    if (Object.keys(updateData).length > 0) {
      const { error: profileErr } = await service
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (profileErr) throw profileErr;
    }

    // Ubah password jika diisi
    if (passwordBaru && passwordBaru.length >= 6) {
      const supabaseServer = await getSupabaseServerClient();
      const { error: pwdErr } = await supabaseServer.auth.updateUser({
        password: passwordBaru
      });
      if (pwdErr) throw pwdErr;
    }

    return { success: true, message: 'Pengaturan profil berhasil diperbarui.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Papan Peringkat Pemilahan Sampah
 * Aturan User:
 * - Halaman warga: diurutkan berdasarkan POIN saja
 * - RT / RW / Aparatur: default diurutkan berdasarkan TOTAL KG sampah, dengan filter per kategori
 */
export async function getPeringkatAction({ kategoriSlug = null, rtId = null, sortBy = 'poin' } = {}) {
  try {
    const service = getSupabaseServiceClient();

    // Jika filter kategori dipilih, ambil dari tabel peringkat_kategori
    if (kategoriSlug && kategoriSlug !== 'semua') {
      const { data: kat } = await service
        .from('kategori_sampah')
        .select('id')
        .eq('slug', kategoriSlug)
        .maybeSingle();

      if (kat) {
        let query = service
          .from('peringkat_kategori')
          .select(`
            total_kg,
            warga:warga_id(id, nama, rt:rt_id(nomor), rw:rw_id(nomor)),
            kategori:kategori_id(nama, slug)
          `)
          .eq('kategori_id', kat.id)
          .order('total_kg', { ascending: false })
          .limit(50);

        const { data, error } = await query;
        if (error) throw error;

        const formatted = (data || []).map((row, idx) => ({
          ranking: idx + 1,
          wargaId: row.warga?.id,
          nama: row.warga?.nama || 'Warga',
          rtNomor: row.warga?.rt?.nomor,
          rwNomor: row.warga?.rw?.nomor,
          totalKg: Number(row.total_kg || 0),
          totalPoin: 0,
          statusPilah: 'sudah'
        }));

        return { success: true, data: formatted };
      }
    }

    // Query standar dari tabel peringkat
    let query = service
      .from('peringkat')
      .select(`
        warga_id,
        nama_tampil,
        rt_id,
        total_poin,
        total_kg,
        jumlah_setoran,
        status_pilah_terakhir,
        rt:rt_id(nomor, rw:rw_id(nomor))
      `);

    if (rtId) {
      query = query.eq('rt_id', rtId);
    }

    if (sortBy === 'kg') {
      query = query.order('total_kg', { ascending: false });
    } else {
      query = query.order('total_poin', { ascending: false }).order('total_kg', { ascending: false });
    }

    const { data: leaderboard, error } = await query.limit(50);
    if (error) throw error;

    const list = (leaderboard || []).map((row, idx) => ({
      ranking: idx + 1,
      wargaId: row.warga_id,
      nama: row.nama_tampil,
      rtNomor: row.rt?.nomor,
      rwNomor: row.rt?.rw?.nomor,
      totalPoin: row.total_poin || 0,
      totalKg: Number(row.total_kg || 0),
      jumlahSetoran: row.jumlah_setoran || 0,
      statusPilah: row.status_pilah_terakhir || 'belum' // Beri tanda badge ke warga yang belum memilah
    }));

    return {
      success: true,
      data: list
    };
  } catch (err) {
    console.error('Error getPeringkatAction:', err);
    return { success: false, error: err.message, data: [] };
  }
}
