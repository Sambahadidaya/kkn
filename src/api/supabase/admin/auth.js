'use server';

// Server Action Khusus Admin untuk Manajemen Akun Aparatur (RT, RW, Kelurahan, Petugas)
import { getSupabaseServiceClient } from '../../../utils/supabaseUtils';
import { assertRole } from '../../../scurity/roleakses';
import { sanitizeEmail, sanitizePhone, sanitizeString, sanitizeUsername } from '../../../scurity/sanitaze';
import { resolveWilayahIds } from '../public/registrasi';

export async function getDaftarAkunAction() {
  try {
    await assertRole(['admin']);
    const service = getSupabaseServiceClient();

    const { data: accounts, error } = await service
      .from('profiles')
      .select('*, rt:rt_id(nomor), rw:rw_id(nomor, kelurahan)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: accounts || []
    };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function buatAkunAparaturAction({
  nama,
  username,
  email,
  noTelepon,
  password,
  role, // 'petugas' | 'rt' | 'rw' | 'kelurahan'
  nomorRt,
  nomorRw,
  rtId,
  rwId
}) {
  try {
    await assertRole(['admin']);
    const service = getSupabaseServiceClient();

    if (!email || !password || !nama || !role) {
      return { success: false, error: 'Nama, email, password, dan role wajib diisi.' };
    }

    // Resolusi wilayah jika role adalah rt atau rw
    let finalRwId = rwId || null;
    let finalRtId = rtId || null;

    if (role === 'rt' || role === 'rw') {
      const { rwId: resRw, rtId: resRt } = await resolveWilayahIds(service, {
        nomorRw,
        nomorRt,
        rwId,
        rtId
      });
      finalRwId = resRw;
      finalRtId = role === 'rt' ? resRt : null;

      if (role === 'rw' && !finalRwId) {
        return { success: false, error: 'Nomor RW wajib diisi untuk akun RW.' };
      }
      if (role === 'rt' && (!finalRwId || !finalRtId)) {
        return { success: false, error: 'Nomor RW dan RT wajib diisi untuk akun RT.' };
      }
    }

    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitizePhone(noTelepon);
    const cleanNama = sanitizeString(nama);
    const cleanUsername = sanitizeUsername(username || cleanEmail.split('@')[0]);

    // 1. Buat user di Supabase Auth
    const { data: authCreated, error: authError } = await service.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { nama: cleanNama, role }
    });

    if (authError || !authCreated?.user) {
      return { success: false, error: authError?.message || 'Gagal membuat akun auth.' };
    }

    const userId = authCreated.user.id;

    // 2. Simpan profil dengan role terpilih
    const { error: profileError } = await service.from('profiles').insert({
      id: userId,
      username: cleanUsername,
      nama: cleanNama,
      email: cleanEmail,
      no_telepon: cleanPhone,
      role,
      rt_id: finalRtId,
      rw_id: finalRwId,
      aktif: true
    });

    if (profileError) {
      await service.auth.admin.deleteUser(userId);
      return { success: false, error: 'Gagal membuat profil: ' + profileError.message };
    }

    return {
      success: true,
      message: `Akun ${role.toUpperCase()} untuk ${cleanNama} berhasil dibuat.`
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function toggleStatusAkunAction(userId, statusAktif) {
  try {
    await assertRole(['admin']);
    const service = getSupabaseServiceClient();

    const { error } = await service
      .from('profiles')
      .update({ aktif: statusAktif })
      .eq('id', userId);

    if (error) throw error;
    return { success: true, message: `Status akun berhasil diubah.` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
