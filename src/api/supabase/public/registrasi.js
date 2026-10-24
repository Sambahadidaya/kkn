'use server';

// Server Action untuk Registrasi Warga 4-Tahap (Disimpan Saat Tombol Submit Ditekan di Tahap 4)
import { getSupabaseServiceClient, getSupabaseServerClient } from '../../../utils/supabaseUtils';
import { sanitizeEmail, sanitizePhone, sanitizeString, sanitizeUsername } from '../../../scurity/sanitaze';
import { validatePhone, validateEmail, validatePassword, validateNama, generateDefaultUsername } from '../../../scurity/formatLimitKarak';
import { encryptText, hashNik } from '../../../lib/crypto';
import { uploadKtpPhoto } from '../storage';
import { checkRateLimit } from '../../../scurity/ratelimit';

export async function resolveWilayahIds(service, { nomorRw, nomorRt, rwId, rtId }) {
  let finalRwId = rwId || null;
  let finalRtId = rtId || null;

  // Resolusi RW dari nomorRw (angka)
  if (nomorRw !== undefined && nomorRw !== null && nomorRw !== '') {
    const rwNum = parseInt(nomorRw, 10);
    if (!isNaN(rwNum)) {
      const { data: existingRw } = await service
        .from('rw')
        .select('id')
        .eq('nomor', rwNum)
        .maybeSingle();

      if (existingRw) {
        finalRwId = existingRw.id;
      } else {
        const { data: newRw, error: rwErr } = await service
          .from('rw')
          .insert({ nomor: rwNum, kelurahan: 'Kelurahan' })
          .select('id')
          .single();
        if (!rwErr && newRw) {
          finalRwId = newRw.id;
        }
      }
    }
  }

  // Resolusi RT dari nomorRt (angka)
  if (nomorRt !== undefined && nomorRt !== null && nomorRt !== '') {
    const rtNum = parseInt(nomorRt, 10);
    if (!isNaN(rtNum)) {
      // Pastikan ada RW induk
      if (!finalRwId) {
        let { data: defaultRw } = await service
          .from('rw')
          .select('id')
          .limit(1)
          .maybeSingle();
        if (!defaultRw) {
          const { data: createdRw } = await service
            .from('rw')
            .insert({ nomor: 1, kelurahan: 'Kelurahan' })
            .select('id')
            .single();
          defaultRw = createdRw;
        }
        if (defaultRw) finalRwId = defaultRw.id;
      }

      if (finalRwId) {
        const { data: existingRt } = await service
          .from('rt')
          .select('id')
          .eq('rw_id', finalRwId)
          .eq('nomor', rtNum)
          .maybeSingle();

        if (existingRt) {
          finalRtId = existingRt.id;
        } else {
          const { data: newRt, error: rtErr } = await service
            .from('rt')
            .insert({ rw_id: finalRwId, nomor: rtNum })
            .select('id')
            .single();
          if (!rtErr && newRt) {
            finalRtId = newRt.id;
          }
        }
      }
    }
  }

  return { rwId: finalRwId, rtId: finalRtId };
}

export async function registrasiWargaAction(formData) {
  try {
    const {
      // Data Tahap 1 (Nama Saja)
      namaUser,
      // Data Tahap 2 & 3 (KTP & Wilayah)
      nik,
      namaKtp,
      alamatKtp,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      pekerjaan,
      detailKtp,
      nomorRw,
      nomorRt,
      rtId,
      rwId,
      nomorRumah,
      fotoKtpBase64,
      // Data Tahap 4 (Kontak & Password)
      emailUser,
      noTelepon,
      password,
      username
    } = formData;

    // 1. Validasi format ketat menggunakan formatLimitKarak
    const nameCheck = validateNama(namaUser);
    if (!nameCheck.valid) {
      return { success: false, error: nameCheck.message };
    }

    const phoneCheck = validatePhone(noTelepon);
    if (!phoneCheck.valid) {
      return { success: false, error: phoneCheck.message };
    }

    const emailCheck = validateEmail(emailUser);
    if (!emailCheck.valid) {
      return { success: false, error: emailCheck.message };
    }

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      return { success: false, error: pwdCheck.message };
    }

    const service = getSupabaseServiceClient();

    // Resolusi wilayah RT dan RW dari nomor atau ID
    const { rwId: resolvedRwId, rtId: resolvedRtId } = await resolveWilayahIds(service, {
      nomorRw,
      nomorRt,
      rwId,
      rtId
    });

    if (!nik || !namaKtp || !resolvedRtId || !nomorRumah) {
      return { success: false, error: 'Data KTP, nomor RT, nomor RW, dan nomor rumah wajib diisi.' };
    }

    const cleanEmail = sanitizeEmail(emailUser);
    const cleanPhone = sanitizePhone(noTelepon);
    const cleanNama = sanitizeString(namaUser);
    const cleanNomorRumah = sanitizeString(nomorRumah, 20);

    // 2. Cek Rate Limiter
    if (!checkRateLimit(`reg_${cleanEmail}`, 5, 60000)) {
      return { success: false, error: 'Terlalu banyak permintaan registrasi. Silakan tunggu.' };
    }

    // 3. Cek apakah NIK sudah pernah terdaftar
    const nikHashed = hashNik(nik);
    const { data: existingNik } = await service
      .from('ktp_data')
      .select('user_id')
      .eq('nik_hash', nikHashed)
      .maybeSingle();

    if (existingNik) {
      return { success: false, error: 'Nomor KTP/NIK ini sudah pernah didaftarkan.' };
    }

    // 4. Generate default username dari nama jika tidak diinputkan (dan nanti bisa diatur di halaman pengaturan)
    let baseUsername = sanitizeUsername(username || generateDefaultUsername(cleanNama));
    if (!baseUsername || baseUsername.length < 3) {
      baseUsername = 'warga';
    }

    // Pastikan username unik di tabel profiles
    let cleanUsername = baseUsername;
    let counter = 1;
    while (counter <= 25) {
      const { data: userWithSameName } = await service
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (!userWithSameName) {
        break;
      }
      cleanUsername = `${baseUsername.slice(0, 24)}${counter}`;
      counter++;
    }

    // 5. Cek apakah nomor telepon atau email sudah dipakai
    const { data: existingProfile } = await service
      .from('profiles')
      .select('id, email, username, no_telepon')
      .or(`email.eq.${cleanEmail},no_telepon.eq.${cleanPhone}`)
      .maybeSingle();

    if (existingProfile) {
      if (existingProfile.email === cleanEmail) {
        return { success: false, error: 'Alamat email ini sudah terdaftar.' };
      }
      if (existingProfile.no_telepon === cleanPhone) {
        return { success: false, error: 'Nomor telepon ini sudah terdaftar.' };
      }
    }

    // 6. Buat Akun Auth di Supabase menggunakan admin createUser
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

    // 7. Upload mentahan foto KTP ke bucket privat 'ktp'
    let fotoPath = null;
    if (fotoKtpBase64) {
      const uploadRes = await uploadKtpPhoto(fotoKtpBase64, `${userId}.jpg`);
      if (uploadRes.success) {
        fotoPath = uploadRes.path;
      }
    }

    // 8. Simpan Profil Warga (dengan username otomatis dari nama)
    const { error: profileError } = await service.from('profiles').insert({
      id: userId,
      username: cleanUsername,
      nama: cleanNama,
      email: cleanEmail,
      no_telepon: cleanPhone,
      role: 'warga',
      rt_id: resolvedRtId,
      rw_id: resolvedRwId || null,
      aktif: true
    });

    if (profileError) {
      // Rollback auth user
      await service.auth.admin.deleteUser(userId);
      return { success: false, error: 'Gagal membuat profil: ' + profileError.message };
    }

    // 9. Simpan Data Rumah (menghasilkan rumah.id unik yang dipakai sebagai QR Rumah)
    const { error: rumahError } = await service.from('rumah').insert({
      rt_id: resolvedRtId,
      nomor_rumah: cleanNomorRumah,
      warga_id: userId
    });

    if (rumahError) {
      console.warn('Peringatan saat membuat data rumah:', rumahError.message);
    }

    // 10. Enkripsi dan Simpan Data KTP (AES-256-GCM)
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

    // 11. Login otomatis user agar langsung masuk ke sesi
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
