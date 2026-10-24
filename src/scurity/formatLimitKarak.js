// Validasi format dan batasan karakter untuk Login dan Registrasi
// Sesuai task1_revisi2

export const LIMITS = {
  PHONE_MIN_DIGITS: 12,
  PHONE_MAX_DIGITS: 15,
  PASSWORD_MIN: 6,
  NAMA_MIN: 3,
  NAMA_MAX: 100,
  USERNAME_MIN: 3,
  USERNAME_MAX: 30
};

/**
 * Validasi nomor telepon:
 * - Harus diawali '08' atau '+62' (atau '628')
 * - Panjang total angka (digits) antara 12 sampai 15 digit
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, message: 'Nomor telepon wajib diisi.' };
  }

  const trimmed = phone.trim();

  // Awalan harus +62 atau 08 atau 628
  const prefixMatch = /^(\+62|08|628)/.test(trimmed);
  if (!prefixMatch) {
    return { valid: false, message: 'Nomor telepon harus diawali 08 atau +62.' };
  }

  // Hitung jumlah digit angka saja
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < LIMITS.PHONE_MIN_DIGITS || digitsOnly.length > LIMITS.PHONE_MAX_DIGITS) {
    return {
      valid: false,
      message: `Nomor telepon harus memiliki panjang ${LIMITS.PHONE_MIN_DIGITS}-${LIMITS.PHONE_MAX_DIGITS} angka.`
    };
  }

  return { valid: true, message: '' };
}

/**
 * Validasi email ketat (format @domain.com atau domain TLD valid minimal 2 karakter)
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Alamat email wajib diisi.' };
  }

  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: 'Format email tidak valid (contoh: warga@domain.com).' };
  }

  return { valid: true, message: '' };
}

/**
 * Validasi kata sandi minimal 6 karakter
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Kata sandi wajib diisi.' };
  }

  if (password.length < LIMITS.PASSWORD_MIN) {
    return {
      valid: false,
      message: `Kata sandi minimal ${LIMITS.PASSWORD_MIN} karakter.`
    };
  }

  return { valid: true, message: '' };
}

/**
 * Validasi nama lengkap
 */
export function validateNama(nama) {
  if (!nama || typeof nama !== 'string' || !nama.trim()) {
    return { valid: false, message: 'Nama lengkap wajib diisi.' };
  }

  const trimmed = nama.trim();
  if (trimmed.length < LIMITS.NAMA_MIN) {
    return { valid: false, message: `Nama lengkap minimal ${LIMITS.NAMA_MIN} karakter.` };
  }

  return { valid: true, message: '' };
}

/**
 * Validasi username (opsional diatur di halaman profil)
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Username wajib diisi.' };
  }

  const trimmed = username.trim().toLowerCase();
  if (trimmed.length < LIMITS.USERNAME_MIN || trimmed.length > LIMITS.USERNAME_MAX) {
    return {
      valid: false,
      message: `Username harus antara ${LIMITS.USERNAME_MIN}-${LIMITS.USERNAME_MAX} karakter.`
    };
  }

  const usernameRegex = /^[a-z0-9_.-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { valid: false, message: 'Username hanya boleh huruf kecil, angka, titik, strip, atau garis bawah.' };
  }

  return { valid: true, message: '' };
}

/**
 * Buat username default dari nama
 * Contoh: "Siti Rahmawati" -> "sitirahmawati"
 */
export function generateDefaultUsername(nama) {
  if (!nama || typeof nama !== 'string') return 'warga';
  const clean = nama
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
  return clean || 'warga';
}
