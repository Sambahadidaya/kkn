'use server';

// Server Action untuk Penjadwalan Patroli Sampah (View untuk Semua, CRUD Khusus Petugas/Admin)
import { getSupabaseServerClient, getSupabaseServiceClient } from '../../../utils/supabaseUtils';
import { getCurrentUserProfile, assertRole } from '../../../scurity/roleakses';

export async function getJadwalPatroliAction() {
  try {
    const service = getSupabaseServiceClient();

    const { data: jadwalList, error } = await service
      .from('jadwal_patroli')
      .select(`
        id,
        tanggal,
        jam_mulai,
        jam_selesai,
        status,
        catatan,
        petugas:petugas_id(id, nama),
        rts:jadwal_patroli_rt(
          rt:rt_id(id, nomor, rw:rw_id(nomor))
        )
      `)
      .order('tanggal', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: jadwalList || []
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function simpanJadwalAction({ id, tanggal, jamMulai, jamSelesai, rtIds = [], catatan, status = 'terjadwal' }) {
  try {
    const profile = await assertRole(['petugas', 'admin']);
    const service = getSupabaseServiceClient();

    if (!tanggal || !jamMulai || rtIds.length === 0) {
      return { success: false, error: 'Tanggal, jam mulai, dan minimal 1 RT patroli wajib dipilih.' };
    }

    let jadwalId = id;

    if (jadwalId) {
      // UPDATE
      const { error: updErr } = await service
        .from('jadwal_patroli')
        .update({
          tanggal,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai || null,
          catatan,
          status
        })
        .eq('id', jadwalId);

      if (updErr) throw updErr;

      // Hapus relasi RT lama lalu buat yang baru
      await service.from('jadwal_patroli_rt').delete().eq('jadwal_id', jadwalId);
    } else {
      // INSERT BARU
      const { data: newJadwal, error: insErr } = await service
        .from('jadwal_patroli')
        .insert({
          tanggal,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai || null,
          catatan,
          status,
          petugas_id: profile.id,
          dibuat_oleh: profile.id
        })
        .select('id')
        .single();

      if (insErr) throw insErr;
      jadwalId = newJadwal.id;
    }

    // Masukkan relasi RT
    const rtInserts = rtIds.map(rt_id => ({
      jadwal_id: jadwalId,
      rt_id
    }));

    const { error: rtErr } = await service.from('jadwal_patroli_rt').insert(rtInserts);
    if (rtErr) throw rtErr;

    return {
      success: true,
      message: 'Jadwal patroli berhasil disimpan.'
    };
  } catch (err) {
    console.error('Error simpanJadwalAction:', err);
    return { success: false, error: err.message };
  }
}

export async function hapusJadwalAction(id) {
  try {
    await assertRole(['petugas', 'admin']);
    const service = getSupabaseServiceClient();

    const { error } = await service.from('jadwal_patroli').delete().eq('id', id);
    if (error) throw error;

    return { success: true, message: 'Jadwal berhasil dihapus.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
