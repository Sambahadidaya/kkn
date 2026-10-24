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
      `Periksa gambar ini dengan teliti. 
1. Tentukan apakah gambar ini BENAR-BENAR merupakan foto dokumen fisik Kartu Tanda Penduduk (KTP) Republik Indonesia yang valid dan terbaca informasinya.
2. JIKA GAMBAR BUKAN KTP (misalnya foto orang, selfie, pemandangan, benda sembarangan, dokumen non-KTP) ATAU KTP SANGAT BURAM/TIDAK TERBACA, kembalikan JSON persis seperti ini:
{"is_ktp": false, "alasan": "Gambar bukan KTP Indonesia yang valid atau foto terlalu buram sehingga data tidak dapat terbaca."}
3. JIKA GAMBAR ADALAH KTP VALID, ekstrak informasinya ke dalam JSON murni dengan atribut:
{"is_ktp": true, "nik": "16 digit NIK", "nama": "Nama lengkap", "tempat_lahir": "...", "tanggal_lahir": "DD-MM-YYYY", "jenis_kelamin": "LAKI-LAKI/PEREMPUAN", "alamat": "...", "rt_rw": "...", "kel_desa": "...", "kecamatan": "...", "agama": "...", "status_perkawinan": "...", "pekerjaan": "...", "kewarganegaraan": "WNI"}.
Wajib berikan format JSON murni tanpa awalan/akhiran markdown.`;

    const response = await openai.chat.completions.create({
      model: aiConfig.model_ocr || 'gpt-6-luna',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah sistem AI verifikasi dokumen identitas resmi KTP Republik Indonesia. Tugas utamamu adalah memvalidasi apakah gambar adalah KTP asli dan mengekstrak datanya. Jika bukan KTP atau gambar tidak relevan, tolak secara tegas dengan is_ktp: false. Selalu respon dengan JSON valid murni.'
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
      max_completion_tokens: 1000,
      temperature: 1
    });

    const rawText = response.choices?.[0]?.message?.content || '{}';
    let parsedData = {};

    try {
      // Bersihkan jika ada format ```json ... ```
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.warn('Gagal parse direct JSON dari OpenAI OCR, raw output:', rawText);
      return {
        success: false,
        isKtp: false,
        error: 'Gagal membaca format data KTP dari AI. Silakan foto ulang dengan pencahayaan yang cukup.'
      };
    }

    // Validasi ketat hasil deteksi
    if (parsedData.is_ktp === false || !parsedData.nik || String(parsedData.nik).trim().length < 8) {
      return {
        success: false,
        isKtp: false,
        error: parsedData.alasan || 'Gambar yang Anda ambil tidak terdeteksi sebagai KTP Indonesia atau NIK tidak terbaca. Harap foto ulang KTP Anda.'
      };
    }

    return {
      success: true,
      isKtp: true,
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
