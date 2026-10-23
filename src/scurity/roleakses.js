// Pengaman Hak Akses Role di Sisi Server Action
import { getSupabaseServerClient, getSupabaseServiceClient } from '../utils/supabaseUtils';

/**
 * Mendapatkan sesi dan profil user saat ini
 */
export async function getCurrentUserProfile() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // Ambil profil dari tabel profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, rt:rt_id(nomor, rw_id), rw:rw_id(nomor, kelurahan)')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.aktif) {
    return null;
  }

  return {
    ...profile,
    authEmail: user.email
  };
}

/**
 * Pastikan user memiliki salah satu dari role yang diizinkan
 */
export async function assertRole(allowedRoles = []) {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    throw new Error('Anda belum masuk ke sistem (Unauthorized)');
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    throw new Error(`Akses ditolak: role '${profile.role}' tidak memiliki izin.`);
  }

  return profile;
}

/**
 * Cek apakah user berwenang melihat data KTP warga target
 * Syarat:
 * 1. Admin: boleh semua
 * 2. RT: boleh warga di RT-nya sendiri
 * 3. Warga bersangkutan: jika sudah ada persetujuan aktif di data_access_requests
 */
export async function canAccessCitizenKtp(currentUserProfile, targetWargaId) {
  if (!currentUserProfile) return false;
  const { role, rt_id, id } = currentUserProfile;

  if (role === 'admin') return true;

  if (role === 'rt') {
    // Cek apakah targetWarga berada di RT yang sama
    const supabase = getSupabaseServiceClient();
    const { data: target } = await supabase
      .from('profiles')
      .select('rt_id')
      .eq('id', targetWargaId)
      .maybeSingle();
    return Boolean(target && target.rt_id === rt_id);
  }

  if (id === targetWargaId) {
    // Cek apakah punya permohonan yang disetujui
    const supabase = getSupabaseServiceClient();
    const { data: req } = await supabase
      .from('data_access_requests')
      .select('id, status, expires_at')
      .eq('requester_id', id)
      .eq('status', 'disetujui')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (req) {
      if (!req.expires_at || new Date(req.expires_at) > new Date()) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validasi apakah role yang mengakses rute /[nama] sesuai dengan role login
 */
export async function validateRoleRoute(targetRole) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return {
      authorized: false,
      redirectTo: '/login',
      profile: null
    };
  }

  // Jika admin mengakses rute admin
  if (targetRole === 'admin' && profile.role !== 'admin') {
    return {
      authorized: false,
      redirectTo: `/${profile.role}/beranda`,
      profile
    };
  }

  // Jika user mengakses halaman role orang lain
  if (targetRole !== 'admin' && profile.role !== targetRole) {
    // Admin diperbolehkan melihat preview role lain
    if (profile.role === 'admin') {
      return { authorized: true, profile };
    }
    return {
      authorized: false,
      redirectTo: `/${profile.role}/beranda`,
      profile
    };
  }

  return {
    authorized: true,
    profile
  };
}

