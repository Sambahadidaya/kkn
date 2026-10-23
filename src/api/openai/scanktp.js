'use server';

// Server Action untuk OCR KTP Menggunakan OpenAI Vision
import { getOpenAIClient, getAiConfig } from '../../lib/openai';

export async function scanKtpAction(imageBase64) {
  try {
    if (!imageBase64) {
      return { success: false, error: 'Foto KTP tidak boleh kosong.' };
    }

    const aiConfig = await getAiConfig();
    const openai = getOpenAIClient();

    // Pastikan format data URL bersih
    let cleanDataUrl = imageBase64;
    if (!cleanDataUrl.startsWith('data:image')) {
      cleanDataUrl = `data:image/jpeg;base64,${cleanDataUrl}`;
    }

    const prompt = aiConfig.prompt_ocr_ktp || 
      'Ekstrak seluruh informasi identitas dari foto KTP Indonesia ini ke dalam format JSON murni tanpa markdown, dengan atribut: nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, rt_rw, kel_desa, kecamatan, agama, status_perkawinan, pekerjaan, kewarganegaraan. Jika ada nilai yang tidak terbaca, beri nilai string kosong atau null.';

    const response = await openai.chat.completions.create({
      model: aiConfig.model_ocr || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah sistem OCR AI profesional spesialis dokumen kependudukan KTP Indonesia. Selalu berikan output dalam format JSON valid tanpa tanda kutip markdown ```json.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: cleanDataUrl,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    const rawText = response.choices?.[0]?.message?.content || '{}';
    let parsedData = {};

    try {
      // Bersihkan jika ada format ```json ... ```
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.warn('Gagal parse direct JSON dari OpenAI OCR, raw output:', rawText);
      parsedData = {
        nama: '',
        nik: '',
        alamat: '',
        pekerjaan: ''
      };
    }

    return {
      success: true,
      data: parsedData
    };
  } catch (err) {
    console.error('Error pada scanKtpAction:', err);
    return {
      success: false,
      error: err.message || 'Gagal memproses foto KTP dengan AI.'
    };
  }
}
