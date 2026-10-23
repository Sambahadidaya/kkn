'use server';

// Server Action untuk Melihat Riwayat Setoran Sampah
import { getSupabaseServiceClient } from '../../../utils/supabaseUtils';
import { getCurrentUserProfile } from '../../../scurity/roleakses';

export async function getRiwayatSampahAction({ page = 1, limit = 20, wargaId = null } = {}) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return { success: false, error: 'Belum login' };

    const service = getSupabaseServiceClient();
    const offset = (page - 1) * limit;

    let query = service
      .from('setoran_sampah')
      .select(`
        id,
        tanggal,
        status_pilah,
        poin,
        catatan,
        created_at,
        warga:warga_id(id, nama, no_telepon, rt:rt_id(nomor), rw:rw_id(nomor)),
        petugas:petugas_id(nama),
        rumah:rumah_id(nomor_rumah),
        items:setoran_item(
          id,
          berat_kg,
          kategori:kategori_id(nama, slug),
          jenis:jenis_id(nama)
        )
      `, { count: 'exact' });

    // Filter berdasarkan role
    if (profile.role === 'warga') {
      query = query.eq('warga_id', profile.id);
    } else if (profile.role === 'petugas') {
      // Petugas melihat setoran yang dicatatnya atau filter warga
      if (wargaId) query = query.eq('warga_id', wargaId);
    } else if (profile.role === 'rt') {
      // RT melihat setoran warganya
      const { data: wargaRt } = await service
        .from('profiles')
        .select('id')
        .eq('rt_id', profile.rt_id);
      const wargaIds = (wargaRt || []).map(w => w.id);
      query = query.in('warga_id', wargaIds);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (err) {
    console.error('Error getRiwayatSampahAction:', err);
    return { success: false, error: err.message, data: [] };
  }
}
