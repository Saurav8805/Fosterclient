import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is a dashboard route
  if (pathname.startsWith('/dashboard')) {
    // Check for session token in cookies
    const sessionToken = request.cookies.get('session_token')
    const userId = request.cookies.get('userId')

    // If no session token or userId, redirect to login
    if (!sessionToken || !userId) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Check if user is trying to access login page while authenticated
  if (pathname === '/login') {
    const sessionToken = request.cookies.get('session_token')
    const userId = request.cookies.get('userId')

    // If authenticated, redirect to dashboard
    if (sessionToken && userId) {
      const dashboardUrl = new URL('/dashboard/profile', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, manifest, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|json|js)).*)',
  ],
}
