// Next.js 16 Proxy / Middleware Handler
import { NextResponse } from 'next/server';

/**
 * Proxy function yang dijalankan Next.js untuk setiap request
 */
export default function proxy(request) {
  return NextResponse.next();
}

// Named export untuk kompatibilitas Next.js 16
export { proxy };

// Re-export helper validasi role rute
export { validateRoleRoute } from './scurity/roleakses';
