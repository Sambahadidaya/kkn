// Helper Pengelolaan Berkas Privat di Supabase Storage (Server-Only Service Role)
import { getSupabaseServiceClient } from '../../utils/supabaseUtils';

const BUCKET_KTP = 'ktp';

/**
 * Upload buffer atau base64 foto KTP ke bucket privat 'ktp'
 * @param {string|Buffer} fileData - Base64 data URL atau buffer gambar
 * @param {string} fileName - Nama file unik (contoh: ktp_userId_timestamp.jpg)
 */
export async function uploadKtpPhoto(fileData, fileName) {
  try {
    const supabase = getSupabaseServiceClient();

    let buffer;
    let contentType = 'image/jpeg';

    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const parts = fileData.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) contentType = match[1];
      buffer = Buffer.from(parts[1], 'base64');
    } else if (Buffer.isBuffer(fileData)) {
      buffer = fileData;
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }

    const path = `uploads/${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage
      .from(BUCKET_KTP)
      .upload(path, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error('Gagal upload foto KTP ke storage:', error);
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (err) {
    console.error('Error saat uploadKtpPhoto:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Buat Signed URL berbatas waktu (misal 5 menit) untuk melihat foto KTP
 * Hanya dipanggil oleh pihak berwenang (Admin, RT, atau warga yang disetujui)
 */
export async function getSignedKtpUrl(filePath, expiresInSeconds = 300) {
  if (!filePath) return null;
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_KTP)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data) return null;
    return data.signedUrl;
  } catch (err) {
    console.error('Gagal membuat signed url KTP:', err);
    return null;
  }
}
