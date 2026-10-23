'use server';

// Server Action untuk Pencatatan dan Analitik Trafik Pengunjung
import { getSupabaseServiceClient } from '../../../utils/supabaseUtils';
import { assertRole } from '../../../scurity/roleakses';

export async function catatTrafikAction(path, role = null) {
  try {
    const service = getSupabaseServiceClient();
    await service.from('trafik_log').insert({
      path,
      role
    });
    return { success: true };
  } catch (_) {
    return { success: false };
  }
}

export async function getStatistikTrafikAction() {
  try {
    await assertRole(['admin']);
    const service = getSupabaseServiceClient();

    const { data: logs } = await service
      .from('trafik_log')
      .select('created_at, path, role')
      .order('created_at', { ascending: false })
      .limit(500);

    const totalKunjungan = logs?.length || 0;
    const perRole = {};
    (logs || []).forEach(l => {
      const r = l.role || 'tamu';
      perRole[r] = (perRole[r] || 0) + 1;
    });

    return {
      success: true,
      totalKunjungan,
      perRole,
      recent: logs?.slice(0, 20) || []
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
