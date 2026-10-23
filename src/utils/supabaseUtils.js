// Client Supabase Khusus Server-Side (Server Action / SSR)
// Tidak pernah mengekspos SUPABASE_URL atau SERVICE_ROLE_KEY ke client bundle
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-service-key';

if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder')) {
  console.warn('\n⚠️ [PERINGATAN]: SUPABASE_URL belum diisi di file .env.local! Silakan buat file .env.local dan isi kredensial Supabase Anda.\n');
}

/**
 * Mendapatkan client Supabase berbasis sesi user dari cookies (SSR/Server Action)
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (_) {
          // Ignore jika dipanggil di Server Component yang read-only
        }
      }
    }
  });
}

/**
 * Mendapatkan client Supabase Service Role untuk operasi backend / admin
 * (seperti bypass RLS saat registrasi, akses bucket private KTP, manajemen user)
 */
export function getSupabaseServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

/**
 * Mendapatkan client Supabase Anon biasa di sisi server
 */
export function getSupabaseAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false
    }
  });
}
