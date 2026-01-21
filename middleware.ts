import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(_req: NextRequest) {
  void _req
  // IMPORTANT:
  // Next.js Middleware runs on the edge/runtime and does not automatically have
  // access to the Supabase auth cookies when using a plain supabase-js client.
  // The previous implementation always saw `session = null`, which caused
  // successful logins to be redirected back to /login.
  //
  // We rely on existing client-side guards in:
  // - app/user/layout.tsx (auth check)
  // - app/admin/page.tsx and app/rider/page.tsx (role checks)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.).*)',
  ],
}
