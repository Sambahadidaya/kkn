'use server';

// Server Action untuk OCR Kartu Keluarga (Opsional / Pelengkap)
import { getOpenAIClient, getAiConfig } from '../../lib/openai';

export async function scanKkAction(imageBase64) {
  try {
    if (!imageBase64) return { success: false, error: 'Foto dokumen kosong.' };
    const aiConfig = await getAiConfig();
    const openai = getOpenAIClient();

    let cleanDataUrl = imageBase64;
    if (!cleanDataUrl.startsWith('data:image')) {
      cleanDataUrl = `data:image/jpeg;base64,${cleanDataUrl}`;
    }

    const response = await openai.chat.completions.create({
      model: aiConfig.model_ocr || 'gpt-6-luna',
      messages: [
        {
          role: 'system',
          content: 'Ekstrak nomor KK, kepala keluarga, dan alamat dari foto dokumen dalam JSON murni.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Ekstrak data KK berikut.' },
            { type: 'image_url', image_url: { url: cleanDataUrl } }
          ]
        }
      ],
      max_completion_tokens: 800
    });

    const raw = response.choices?.[0]?.message?.content || '{}';
    return { success: true, data: JSON.parse(raw.replace(/```json/g, '').replace(/```/g, '').trim()) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
