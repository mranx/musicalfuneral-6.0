// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verify } from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  console.log('Middleware running for path:', request.nextUrl.pathname);
  
  // Handle order ID tracking for form flows
  if (request.nextUrl.pathname.startsWith('/music') || 
      request.nextUrl.pathname === '/final-video') {
    
    // If form flow has an orderId param, set it in a cookie
    const url = new URL(request.url);
    const orderIdParam = url.searchParams.get('orderId');
    
    if (orderIdParam) {
      // Clone the response and set cookie
      const response = NextResponse.next();
      response.cookies.set('currentOrderId', orderIdParam, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      return response;
    }
  }
  
  // Admin panel routes handling
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip auth check for login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // For admin routes, check for admin_token cookie
    const adminToken = request.cookies.get('admin_token')?.value;

    // Redirect to admin login if no token
    if (!adminToken) {
      console.log('No admin token, redirecting to admin login...');
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
      return response;
    }

    try {
      // Verify the admin token
      verify(adminToken, process.env.JWT_SECRET || 'your-secret-key');
      const response = NextResponse.next();
      // Ensure no caching occurs
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
      return response;
    } catch (error) {
      console.log('Invalid admin token, redirecting to admin login...');
      // Token is invalid, redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
      return response;
    }
  }
  
  // Existing user authentication logic for other routes
  // Check if path starts with /music or /dashboard
  const isMusicPath = request.nextUrl.pathname.startsWith('/music');
  const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard');
  const isProtectedPath = isMusicPath || isDashboardPath;
  
  // Get the authentication token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  console.log('Authentication token:', token ? 'Exists' : 'Does not exist');
  
  // If no token and trying to access protected path, redirect to login
  if (!token && isProtectedPath) {
    console.log('Redirecting to login...');
    
    // Create login URL with callback
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    
    // Return redirect response with cache control
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  }
   
  // Allow the request
  return NextResponse.next();
}

// Match both user-protected and admin routes
export const config = {
  matcher: [
    '/music', 
    '/music/:path*',
    '/dashboard', 
    '/dashboard/:path*',
    '/final-video',
    '/final-video/:path*',
    '/admin/:path*',
    '/((?!admin/register).*)',
  ],
};