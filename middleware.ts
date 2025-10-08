import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Cache static assets
  if (request.nextUrl.pathname.startsWith('/static/') ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|ico|svg)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Cache API responses
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59')
  }

  return response
}

export const config = {
  matcher: [
    '/static/:path*',
    '/_next/image:path*',
    '/api/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}