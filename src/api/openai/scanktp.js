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

    // Instruksi ketat ekstraksi KTP Republik Indonesia
    const instruksiOcr = `Periksa foto KTP Republik Indonesia ini dengan sangat teliti dan presisi:
1. Pastikan gambar adalah fisik Kartu Tanda Penduduk (KTP) Republik Indonesia.
2. Jika BUKAN KTP atau sangat buram/tidak terbaca, kembalikan JSON:
   {"is_ktp": false, "alasan": "Gambar bukan KTP Indonesia yang valid atau foto terlalu buram."}
3. Jika KTP VALID, ekstrak data dengan akurasi 100% huruf demi huruf:
   - "nik": 16 digit angka NIK (hanya angka).
   - "nama": Nama LENGKAP pemilik KTP yang tercetak tepat di baris bawah NIK (setelah label "Nama" atau "Nama :"). AMBIL HANYA NAMA ORANG TERSEBUT, tanpa kata "Nama" atau tanda titik dua. Gunakan HURUF BESAR persis seperti pada kartu. JANGAN pernah mengambil nama pejabat/kota tanda tangan di kanan bawah atau nama provinsi di bagian atas.
   - "tempat_lahir": Tempat lahir saja (sebelum tanda koma pada baris Tempat/Tgl Lahir).
   - "tanggal_lahir": Tanggal lahir format DD-MM-YYYY (atau seperti yang tertera).
   - "jenis_kelamin": "LAKI-LAKI" atau "PEREMPUAN".
   - "alamat": Alamat jalan/gang/nomor yang tercantum di baris Alamat.
   - "rt_rw": Nomor RT dan RW (misal "003/005").
   - "kel_desa": Kelurahan atau Desa.
   - "kecamatan": Kecamatan.
   - "agama": Agama pemilik.
   - "status_perkawinan": Status perkawinan.
   - "pekerjaan": Pekerjaan.
   - "kewarganegaraan": Kewarganegaraan (biasanya "WNI").

KEMBALIKAN HANYA OBJEK JSON MURNI TANPA BLOK MARKDOWN.`;

    const response = await openai.chat.completions.create({
      model: aiConfig.model_ocr || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah mesin OCR pembaca data identitas KTP Republik Indonesia yang sangat presisi, akurat, dan tidak pernah berhalusinasi. Ekstrak data teks secara teliti terutama nama lengkap pemilik KTP persis sesuai yang tercetak di kartu. Selalu kembalikan respon dalam format JSON valid.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: instruksiOcr },
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

    // Normalisasi dan sanitasi teks nama & NIK
    if (parsedData.nama || parsedData.nama_lengkap || parsedData.Nama) {
      let rawNama = parsedData.nama || parsedData.nama_lengkap || parsedData.Nama || '';
      if (typeof rawNama === 'string') {
        // Hilangkan kemungkinan prefix "Nama :", "Nama:", "Nama -", dsb
        rawNama = rawNama.replace(/^nama\s*[:\-\.]?\s*/i, '').trim();
        // Hilangkan tanda petik
        rawNama = rawNama.replace(/^["']|["']$/g, '').trim();
        parsedData.nama = rawNama;
      }
    }

    if (parsedData.nik) {
      // Pastikan NIK bersih hanya digit
      const digitsOnly = String(parsedData.nik).replace(/\D/g, '').trim();
      if (digitsOnly.length >= 8) {
        parsedData.nik = digitsOnly;
      }
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
