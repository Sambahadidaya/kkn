'use server';

// Server Action untuk Asisten Edukasi Pengelolaan Sampah AI
import { getOpenAIClient, getAiConfig } from '../../lib/openai';

export async function tanyaAiAsistenAction(pertanyaan, history = []) {
  try {
    if (!pertanyaan || typeof pertanyaan !== 'string') {
      return { success: false, error: 'Pertanyaan tidak boleh kosong.' };
    }

    const aiConfig = await getAiConfig();
    if (!aiConfig.asisten_aktif) {
      return {
        success: false,
        error: 'Fitur asisten AI sedang dinonaktifkan oleh Administrator.'
      };
    }

    const openai = getOpenAIClient();
    const systemPrompt = aiConfig.system_prompt_asisten ||
      'Kamu asisten edukasi pengelolaan sampah rumah tangga KKN. Jawab secara ringkas, sopan, praktis, dan ramah untuk warga segala usia. Hindari istilah teknis yang membingungkan.';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: String(h.content || '')
      })),
      { role: 'user', content: pertanyaan.trim() }
    ];

    const response = await openai.chat.completions.create({
      model: aiConfig.model_asisten || 'gpt-6-luna',
      messages,
      max_completion_tokens: 600,
      temperature: 1
    });

    const jawaban = response.choices?.[0]?.message?.content || 'Maaf, belum ada jawaban.';

    return {
      success: true,
      jawaban
    };
  } catch (err) {
    console.error('Error tanyaAiAsistenAction:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan saat berkomunikasi dengan asisten AI.'
    };
  }
}
