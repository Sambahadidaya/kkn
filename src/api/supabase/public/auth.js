'use server';

// Server Action untuk Manajemen Autentikasi Publik & Status Sesi
import { getSupabaseServerClient, getSupabaseServiceClient } from '../../../utils/supabaseUtils';

export async function getCurrentUserAction() {
  try {
    const supabaseServer = await getSupabaseServerClient();
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();

    if (userError || !user) {
      return { success: false, user: null };
    }

    const service = getSupabaseServiceClient();

    // Ambil profil lengkap beserta detail RT, RW, dan Rumah
    const { data: profile } = await service
      .from('profiles')
      .select('*, rt:rt_id(id, nomor, rw_id), rw:rw_id(id, nomor, kelurahan)')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      return { success: false, user: null };
    }

    // Ambil data rumah jika role warga
    let dataRumah = null;
    if (profile.role === 'warga') {
      const { data: rmh } = await service
        .from('rumah')
        .select('id, nomor_rumah, status_pilah_terakhir')
        .eq('warga_id', user.id)
        .maybeSingle();
      dataRumah = rmh;
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        ...profile,
        rumah: dataRumah
      }
    };
  } catch (err) {
    console.error('Error getCurrentUserAction:', err);
    return { success: false, user: null };
  }
}

export async function logoutAction() {
  try {
    const supabaseServer = await getSupabaseServerClient();
    await supabaseServer.auth.signOut();
    return { success: true, redirectTo: '/login' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
