'use server';

// Server Action untuk Pencarian Rumah & Resolusi QR Code Rumah
import { getSupabaseServiceClient } from '../../../utils/supabaseUtils';
import { assertRole } from '../../../scurity/roleakses';

export async function cariRumahAction(query) {
  try {
    await assertRole(['petugas', 'admin', 'rt']);
    const service = getSupabaseServiceClient();

    if (!query || query.trim().length < 1) {
      return { success: true, results: [] };
    }

    // Panggil fungsi RPC cari_rumah
    const { data, error } = await service.rpc('cari_rumah', { q: query.trim() });
    if (error) throw error;

    return {
      success: true,
      results: data || []
    };
  } catch (err) {
    return { success: false, error: err.message, results: [] };
  }
}

export async function resolveQrRumahAction(rumahId) {
  try {
    await assertRole(['petugas', 'admin', 'rt']);
    const service = getSupabaseServiceClient();

    if (!rumahId) {
      return { success: false, error: 'Kode QR kosong.' };
    }

    const { data, error } = await service.rpc('rumah_by_id', { p_id: rumahId.trim() });
    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: false, error: 'Data rumah tidak ditemukan dari QR ini.' };
    }

    return {
      success: true,
      rumah: data[0]
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
