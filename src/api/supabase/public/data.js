'use server';

// Server Action untuk Akses Data Warga, Dekripsi KTP Berjenjang, dan Permintaan Akses
import { getSupabaseServiceClient } from '../../../utils/supabaseUtils';
import { getCurrentUserProfile, assertRole, canAccessCitizenKtp } from '../../../scurity/roleakses';
import { decryptText, encryptText } from '../../../lib/crypto';
import { getSignedKtpUrl } from '../storage';

/**
 * Mengambil data sesuai role:
 * - RT: Daftar warga lengkap di RT-nya dengan dekripsi data KTP
 * - RW: Rekap jumlah & tonase per RT (tanpa detail KTP)
 * - Kelurahan: Rekap per RW & per RT (tanpa detail KTP)
 */
export async function getDataRoleAction() {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return { success: false, error: 'Belum login' };

    const service = getSupabaseServiceClient();
    const role = profile.role;

    // 1. ROLE RT: Melihat data warga lengkap beserta KTP di RT-nya
    if (role === 'rt' || role === 'admin') {
      const filterRtId = role === 'rt' ? profile.rt_id : null;

      let query = service
        .from('profiles')
        .select(`
          id,
          username,
          nama,
          email,
          no_telepon,
          created_at,
          rt:rt_id(nomor),
          rw:rw_id(nomor),
          rumah(id, nomor_rumah, status_pilah_terakhir),
          ktp:ktp_data(*),
          rank:peringkat(total_poin, total_kg, status_pilah_terakhir)
        `)
        .eq('role', 'warga');

      if (filterRtId) {
        query = query.eq('rt_id', filterRtId);
      }

      const { data: citizens, error } = await query.order('nama', { ascending: true });
      if (error) throw error;

      // Dekripsi data KTP warga secara aman di server
      const wargaList = await Promise.all(
        (citizens || []).map(async (c) => {
          let decryptedKtp = null;
          let signedKtpUrl = null;

          if (c.ktp) {
            decryptedKtp = {
              nik: decryptText(c.ktp.nik_enc),
              namaKtp: decryptText(c.ktp.nama_enc),
              alamat: decryptText(c.ktp.alamat_enc),
              tempatLahir: decryptText(c.ktp.tempat_lahir_enc),
              tanggalLahir: decryptText(c.ktp.tanggal_lahir_enc),
              jenisKelamin: decryptText(c.ktp.jenis_kelamin_enc),
              pekerjaan: decryptText(c.ktp.pekerjaan_enc),
              detail: decryptText(c.ktp.detail_enc)
            };

            if (c.ktp.foto_path) {
              signedKtpUrl = await getSignedKtpUrl(c.ktp.foto_path, 600);
            }
          }

          return {
            id: c.id,
            username: c.username,
            nama: c.nama,
            email: c.email,
            noTelepon: c.no_telepon,
            rtNomor: c.rt?.nomor,
            rwNomor: c.rw?.nomor,
            nomorRumah: c.rumah?.[0]?.nomor_rumah || '-',
            statusPilah: c.rumah?.[0]?.status_pilah_terakhir || c.rank?.status_pilah_terakhir || 'belum',
            totalPoin: c.rank?.total_poin || 0,
            totalKg: c.rank?.total_kg || 0,
            ktp: decryptedKtp,
            fotoKtpUrl: signedKtpUrl
          };
        })
      );

      return {
        success: true,
        role: 'rt',
        data: wargaList,
        totalWarga: wargaList.length
      };
    }

    // 2. ROLE RW: Rekap RT saja (tanpa data sensitif)
    if (role === 'rw') {
      const { data: rekap, error } = await service.rpc('rekap_rt');
      if (error) throw error;

      return {
        success: true,
        role: 'rw',
        data: rekap || []
      };
    }

    // 3. ROLE KELURAHAN: Rekap RW & RT (tanpa data sensitif)
    if (role === 'kelurahan') {
      const { data: rekapRw } = await service.rpc('rekap_rw');
      const { data: rekapRt } = await service.rpc('rekap_rt');

      return {
        success: true,
        role: 'kelurahan',
        rekapRw: rekapRw || [],
        rekapRt: rekapRt || []
      };
    }

    // 4. ROLE WARGA: Pengajuan / Cek Permintaan Akses Data Sendiri
    if (role === 'warga') {
      const { data: requests } = await service
        .from('data_access_requests')
        .select('*')
        .eq('requester_id', profile.id)
        .order('created_at', { ascending: false });

      // Cek apakah ada request yang sedang aktif disetujui
      const hasActiveApproval = (requests || []).some(
        r => r.status === 'disetujui' && (!r.expires_at || new Date(r.expires_at) > new Date())
      );

      let myKtp = null;
      let signedPhoto = null;

      if (hasActiveApproval) {
        const { data: rawKtp } = await service
          .from('ktp_data')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (rawKtp) {
          myKtp = {
            nik: decryptText(rawKtp.nik_enc),
            namaKtp: decryptText(rawKtp.nama_enc),
            alamat: decryptText(rawKtp.alamat_enc),
            tempatLahir: decryptText(rawKtp.tempat_lahir_enc),
            tanggalLahir: decryptText(rawKtp.tanggal_lahir_enc),
            jenisKelamin: decryptText(rawKtp.jenis_kelamin_enc),
            pekerjaan: decryptText(rawKtp.pekerjaan_enc)
          };
          if (rawKtp.foto_path) {
            signedPhoto = await getSignedKtpUrl(rawKtp.foto_path, 600);
          }
        }
      }

      return {
        success: true,
        role: 'warga',
        hasActiveApproval,
        requests: requests || [],
        myKtp,
        fotoKtpUrl: signedPhoto
      };
    }

    return { success: false, error: 'Role tidak dikenali.' };
  } catch (err) {
    console.error('Error getDataRoleAction:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Warga mengajukan izin untuk melihat dekripsi data KTP miliknya
 */
export async function ajukanAksesDataAction(alasan) {
  try {
    const profile = await assertRole(['warga']);
    const service = getSupabaseServiceClient();

    const { error } = await service.from('data_access_requests').insert({
      requester_id: profile.id,
      alasan: alasan || 'Permintaan melihat verifikasi data KTP pribadi',
      status: 'pending'
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Permintaan akses berhasil diajukan ke pengurus RT/RW/Kelurahan.'
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Aparatur (RT, RW, Kelurahan, Admin) menyetujui atau menolak permintaan akses warga
 */
export async function prosesPermintaanAksesAction({ requestId, status, batasHari = 1 }) {
  try {
    const profile = await assertRole(['rt', 'rw', 'kelurahan', 'admin']);
    const service = getSupabaseServiceClient();

    const expiresAt = status === 'disetujui'
      ? new Date(Date.now() + batasHari * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await service
      .from('data_access_requests')
      .update({
        status,
        approved_by: profile.id,
        decided_at: new Date().toISOString(),
        expires_at: expiresAt
      })
      .eq('id', requestId);

    if (error) throw error;

    return {
      success: true,
      message: `Permintaan akses berhasil di-${status}.`
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
