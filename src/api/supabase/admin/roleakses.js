'use server';

// Server Action Khusus Admin untuk Manajemen Role Pengguna
import { getSupabaseServiceClient } from '../../../utils/supabaseUtils';
import { assertRole } from '../../../scurity/roleakses';

export async function ubahRolePenggunaAction({ userId, newRole, rtId = null, rwId = null }) {
  try {
    await assertRole(['admin']);
    const service = getSupabaseServiceClient();

    const { error } = await service
      .from('profiles')
      .update({
        role: newRole,
        rt_id: rtId,
        rw_id: rwId
      })
      .eq('id', userId);

    if (error) throw error;

    return {
      success: true,
      message: `Role pengguna berhasil diperbarui menjadi ${newRole}.`
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
