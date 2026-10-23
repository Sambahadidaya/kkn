// Inisialisasi OpenAI Server-Side dan Pengambilan Konfigurasi AI dari Database
import OpenAI from 'openai';
import { getSupabaseServiceClient } from './supabase';

let openaiInstance = null;

export function getOpenAIClient() {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY || 'dummy-key';
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

/**
 * Mengambil konfigurasi model dan system prompt dari tabel ai_config
 */
export async function getAiConfig() {
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from('ai_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      return {
        model_ocr: 'gpt-4o-mini',
        model_asisten: 'gpt-4o-mini',
        system_prompt_asisten: 'Kamu asisten edukasi pengelolaan sampah rumah tangga. Jawab singkat, jelas, dan ramah dalam Bahasa Indonesia.',
        prompt_ocr_ktp: 'Ekstrak data KTP Indonesia menjadi JSON: nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, rt_rw, kel_desa, kecamatan, agama, status_perkawinan, pekerjaan, kewarganegaraan. Jika tidak terbaca isi null.',
        asisten_aktif: true
      };
    }

    return data;
  } catch (err) {
    console.error('Error membaca ai_config:', err);
    return {
      model_ocr: 'gpt-4o-mini',
      model_asisten: 'gpt-4o-mini',
      system_prompt_asisten: 'Kamu asisten edukasi pengelolaan sampah rumah tangga. Jawab singkat, jelas, dan ramah.',
      prompt_ocr_ktp: 'Ekstrak data KTP Indonesia menjadi JSON.',
      asisten_aktif: true
    };
  }
}
