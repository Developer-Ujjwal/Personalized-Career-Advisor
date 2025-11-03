import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/auth';
  
  // Check if user is authenticated by looking for the token
  const token = request.cookies.get('access_token')?.value || '';
  const isAuthenticated = !!token;

  // If the path requires authentication and user is not authenticated, redirect to auth page
  if (!isPublicPath && !isAuthenticated) {
    // Store the original URL to redirect back after authentication
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('callbackUrl', path);
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // If user is authenticated and trying to access auth page, redirect to home
  if (isAuthenticated && path === '/auth') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};