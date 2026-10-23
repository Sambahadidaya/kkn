'use server';

// Server Action Khusus Admin untuk Konfigurasi AI (Model, System Prompt, Prompt OCR)
import { getSupabaseServiceClient } from '../../../utils/supabaseUtils';
import { assertRole } from '../../../scurity/roleakses';

export async function getAiConfigAdminAction() {
  try {
    await assertRole(['admin']);
    const service = getSupabaseServiceClient();

    const { data, error } = await service
      .from('ai_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;

    return {
      success: true,
      data: data || {
        model_ocr: 'gpt-4o-mini',
        model_asisten: 'gpt-4o-mini',
        system_prompt_asisten: 'Kamu asisten edukasi pengelolaan sampah.',
        prompt_ocr_ktp: 'Ekstrak data KTP Indonesia menjadi JSON.',
        asisten_aktif: true
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function simpanAiConfigAction({
  modelOcr,
  modelAsisten,
  systemPromptAsisten,
  promptOcrKtp,
  asistenAktif
}) {
  try {
    const profile = await assertRole(['admin']);
    const service = getSupabaseServiceClient();

    const { error } = await service
      .from('ai_config')
      .upsert({
        id: 1,
        model_ocr: modelOcr || 'gpt-4o-mini',
        model_asisten: modelAsisten || 'gpt-4o-mini',
        system_prompt_asisten: systemPromptAsisten,
        prompt_ocr_ktp: promptOcrKtp,
        asisten_aktif: Boolean(asistenAktif),
        updated_by: profile.id,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return {
      success: true,
      message: 'Konfigurasi AI berhasil diperbarui!'
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
