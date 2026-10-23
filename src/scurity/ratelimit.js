// Rate Limiter Sederhana di Memori untuk Melindungi Endpoint/Action Sensitif
const rateMap = new Map();

/**
 * Cek apakah identifier melebihi batas request
 * @param {string} identifier - IP atau user identifier
 * @param {number} limit - Jumlah maksimal request
 * @param {number} windowMs - Rentang waktu dalam milidetik (default: 60000 = 1 menit)
 * @returns {boolean} true jika diperbolehkan, false jika kena blokir
 */
export function checkRateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const record = rateMap.get(identifier);

  if (!record || now - record.startTime > windowMs) {
    rateMap.set(identifier, { count: 1, startTime: now });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

// Bersihkan cache lama setiap 10 menit
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateMap.entries()) {
      if (now - value.startTime > 300000) {
        rateMap.delete(key);
      }
    }
  }, 300000);
}
