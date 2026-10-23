'use server';

// Server Action untuk Login Multi-Identitas (Email / Username / No. Telepon)
import { getSupabaseServerClient, getSupabaseServiceClient } from '../../../utils/supabaseUtils';
import { sanitizeEmail, sanitizePhone, sanitizeUsername } from '../../../scurity/sanitaze';
import { checkRateLimit } from '../../../scurity/ratelimit';

export async function loginAction({ mode = 'email', identifier, password }) {
  try {
    if (!identifier || !password) {
      return { success: false, error: 'Identitas dan kata sandi wajib diisi.' };
    }

    // Rate limiting sederhana
    const isAllowed = checkRateLimit(`login_${identifier}`, 8, 60000);
    if (!isAllowed) {
      return { success: false, error: 'Terlalu banyak percobaan masuk. Silakan tunggu 1 menit.' };
    }

    const serviceClient = getSupabaseServiceClient();
    let emailToAuth = '';

    if (mode === 'email') {
      emailToAuth = sanitizeEmail(identifier);
    } else if (mode === 'username') {
      const cleanUsername = sanitizeUsername(identifier);
      const { data: userProfile, error: profileErr } = await serviceClient
        .from('profiles')
        .select('email')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (profileErr || !userProfile) {
        return { success: false, error: 'Username tidak ditemukan.' };
      }
      emailToAuth = userProfile.email;
    } else if (mode === 'telepon') {
      const cleanPhone = sanitizePhone(identifier);
      const { data: userProfile, error: profileErr } = await serviceClient
        .from('profiles')
        .select('email')
        .eq('no_telepon', cleanPhone)
        .maybeSingle();

      if (profileErr || !userProfile) {
        return { success: false, error: 'Nomor telepon tidak terdaftar.' };
      }
      emailToAuth = userProfile.email;
    }

    // Login menggunakan SSR client agar session cookie terpasang
    const supabaseServer = await getSupabaseServerClient();
    const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
      email: emailToAuth,
      password
    });

    if (authError || !authData.user) {
      return { success: false, error: 'Kata sandi atau akun tidak cocok.' };
    }

    // Ambil role pengguna
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('role, nama, aktif')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (!profile) {
      return { success: false, error: 'Profil pengguna tidak ditemukan.' };
    }

    if (!profile.aktif) {
      await supabaseServer.auth.signOut();
      return { success: false, error: 'Akun Anda dinonaktifkan. Hubungi pengurus RT/Admin.' };
    }

    // Tentukan URL tujuan
    const targetUrl = profile.role === 'admin' ? '/admin/dashboard' : `/${profile.role}/beranda`;

    return {
      success: true,
      role: profile.role,
      nama: profile.nama,
      redirectTo: targetUrl
    };
  } catch (err) {
    console.error('Error saat loginAction:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat mencoba masuk.'
    };
  }
}
