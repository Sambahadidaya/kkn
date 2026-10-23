'use server';

// Server Action untuk Registrasi Warga 2-Tahap (Hanya Disimpan Saat Tombol Submit Ditekan)
import { getSupabaseServiceClient, getSupabaseServerClient } from '../../../utils/supabaseUtils';
import { sanitizeEmail, sanitizePhone, sanitizeString, sanitizeUsername } from '../../../scurity/sanitaze';
import { encryptText, hashNik } from '../../../lib/crypto';
import { uploadKtpPhoto } from '../storage';
import { checkRateLimit } from '../../../scurity/ratelimit';

export async function registrasiWargaAction(formData) {
  try {
    const {
      // Data Tahap 1
      namaUser,
      emailUser,
      noTelepon,
      password,
      username,
      // Data Tahap 2 (KTP & Wilayah)
      nik,
      namaKtp,
      alamatKtp,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      pekerjaan,
      detailKtp,
      rtId,
      rwId,
      nomorRumah,
      fotoKtpBase64
    } = formData;

    // Validasi kelengkapan data
    if (!emailUser || !password || !namaUser || !noTelepon) {
      return { success: false, error: 'Data akun tahap 1 tidak lengkap.' };
    }

    if (!nik || !namaKtp || !rtId || !nomorRumah) {
      return { success: false, error: 'Data KTP, nomor rumah, dan RT wajib diisi.' };
    }

    const cleanEmail = sanitizeEmail(emailUser);
    const cleanPhone = sanitizePhone(noTelepon);
    const cleanNama = sanitizeString(namaUser);
    const cleanUsername = sanitizeUsername(username || emailUser.split('@')[0]);
    const cleanNomorRumah = sanitizeString(nomorRumah, 20);

    const service = getSupabaseServiceClient();

    // 1. Cek Rate Limiter
    if (!checkRateLimit(`reg_${cleanEmail}`, 5, 60000)) {
      return { success: false, error: 'Terlalu banyak permintaan registrasi. Silakan tunggu.' };
    }

    // 2. Cek apakah NIK sudah pernah terdaftar (menggunakan hashNik tanpa ekspos plain NIK)
    const nikHashed = hashNik(nik);
    const { data: existingNik } = await service
      .from('ktp_data')
      .select('user_id')
      .eq('nik_hash', nikHashed)
      .maybeSingle();

    if (existingNik) {
      return { success: false, error: 'Nomor KTP/NIK ini sudah pernah didaftarkan.' };
    }

    // 3. Cek apakah nomor telepon atau username sudah dipakai
    const { data: existingProfile } = await service
      .from('profiles')
      .select('id, email, username, no_telepon')
      .or(`email.eq.${cleanEmail},no_telepon.eq.${cleanPhone},username.eq.${cleanUsername}`)
      .maybeSingle();

    if (existingProfile) {
      if (existingProfile.email === cleanEmail) {
        return { success: false, error: 'Alamat email ini sudah terdaftar.' };
      }
      if (existingProfile.no_telepon === cleanPhone) {
        return { success: false, error: 'Nomor telepon ini sudah terdaftar.' };
      }
      if (existingProfile.username === cleanUsername) {
        return { success: false, error: 'Username ini sudah digunakan, silakan pilih yang lain.' };
      }
    }

    // 4. Buat Akun Auth di Supabase menggunakan admin createUser
    const { data: authCreated, error: authError } = await service.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        nama: cleanNama,
        role: 'warga'
      }
    });

    if (authError || !authCreated?.user) {
      return { success: false, error: authError?.message || 'Gagal membuat akun auth.' };
    }

    const userId = authCreated.user.id;

    // 5. Upload mentahan foto KTP ke bucket privat 'ktp'
    let fotoPath = null;
    if (fotoKtpBase64) {
      const uploadRes = await uploadKtpPhoto(fotoKtpBase64, `${userId}.jpg`);
      if (uploadRes.success) {
        fotoPath = uploadRes.path;
      }
    }

    // 6. Simpan Profil Warga
    const { error: profileError } = await service.from('profiles').insert({
      id: userId,
      username: cleanUsername,
      nama: cleanNama,
      email: cleanEmail,
      no_telepon: cleanPhone,
      role: 'warga',
      rt_id: rtId,
      rw_id: rwId || null,
      aktif: true
    });

    if (profileError) {
      // Rollback auth user
      await service.auth.admin.deleteUser(userId);
      return { success: false, error: 'Gagal membuat profil: ' + profileError.message };
    }

    // 7. Simpan Data Rumah (menghasilkan rumah.id unik yang dipakai sebagai QR Rumah)
    const { error: rumahError } = await service.from('rumah').insert({
      rt_id: rtId,
      nomor_rumah: cleanNomorRumah,
      warga_id: userId
    });

    if (rumahError) {
      console.warn('Peringatan saat membuat data rumah:', rumahError.message);
    }

    // 8. Enkripsi dan Simpan Data KTP (AES-256-GCM)
    const ktpPayload = {
      user_id: userId,
      nik_hash: nikHashed,
      nik_enc: encryptText(nik),
      nama_enc: encryptText(namaKtp),
      alamat_enc: encryptText(alamatKtp),
      tempat_lahir_enc: encryptText(tempatLahir),
      tanggal_lahir_enc: encryptText(tanggalLahir),
      jenis_kelamin_enc: encryptText(jenisKelamin),
      pekerjaan_enc: encryptText(pekerjaan),
      detail_enc: encryptText(detailKtp || {}),
      foto_path: fotoPath
    };

    const { error: ktpError } = await service.from('ktp_data').insert(ktpPayload);
    if (ktpError) {
      console.error('Error menyimpan data KTP terenkripsi:', ktpError);
    }

    // 9. Login otomatis user agar langsung masuk ke sesi
    try {
      const supabaseServer = await getSupabaseServerClient();
      await supabaseServer.auth.signInWithPassword({
        email: cleanEmail,
        password
      });
    } catch (_) {}

    return {
      success: true,
      redirectTo: '/warga/beranda',
      message: 'Pendaftaran berhasil! Selamat datang di aplikasi pengolahan sampah.'
    };
  } catch (err) {
    console.error('Error saat registrasiWargaAction:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat mendaftar.'
    };
  }
}

/**
 * Mengambil daftar RW dan RT untuk pilihan dropdown pendaftaran
 */
export async function getDaftarWilayahAction() {
  try {
    const service = getSupabaseServiceClient();
    const { data: rwList } = await service
      .from('rw')
      .select('id, nomor, kelurahan')
      .order('nomor', { ascending: true });

    const { data: rtList } = await service
      .from('rt')
      .select('id, rw_id, nomor')
      .order('nomor', { ascending: true });

    return {
      success: true,
      rw: rwList || [],
      rt: rtList || []
    };
  } catch (err) {
    return { success: false, rw: [], rt: [] };
  }
}
