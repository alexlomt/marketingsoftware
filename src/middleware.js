import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

/**
 * Middleware to handle authentication and authorization
 */
export function middleware(request) {
  // Skip middleware for public routes
  const publicRoutes = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/health'
  ];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For API routes, add header to skip Edge Runtime
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-preflight', 'skip');
    
    // Get auth token from cookie
    const authToken = request.cookies.get('auth_token')?.value;
    
    // If no token is present, return unauthorized
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: { 'x-middleware-preflight': 'skip' } }
      );
    }
    
    // Verify token
    try {
      const payload = verifyToken(authToken);
      
      // If token is invalid or expired, return unauthorized
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401, headers: { 'x-middleware-preflight': 'skip' } }
        );
      }
      
      // Check role-based access for admin-only routes
      const adminRoutes = ['/api/admin/'];
      
      const isAdminRoute = adminRoutes.some(route => 
        request.nextUrl.pathname.startsWith(route)
      );
      
      if (isAdminRoute && payload.role !== 'admin') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403, headers: { 'x-middleware-preflight': 'skip' } }
        );
      }
      
      // Add user info to request headers for use in API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.id);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-organization-id', payload.organization_id);
      
      // Continue with the request
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
        headers: {
          'x-middleware-preflight': 'skip'
        }
      });
    } catch (error) {
      // Handle token verification errors
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401, headers: { 'x-middleware-preflight': 'skip' } }
      );
    }
  }
  
  // For non-API routes, continue with existing logic
  
  // Get auth token from cookie
  const authToken = request.cookies.get('auth_token')?.value;
  
  // If no token is present, redirect to login
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify token
  try {
    const payload = verifyToken(authToken);
    
    // If token is invalid or expired, clear cookie and redirect to login
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set({
        name: 'auth_token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0 // Expire immediately
      }) ;
      return response;
    }
    
    // Check role-based access for admin-only routes
    const adminRoutes = ['/admin/'];
    
    const isAdminRoute = adminRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );
    
    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-organization-id', payload.organization_id);
    
    // Continue with the request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  } catch (error) {
    // Handle token verification errors
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0 // Expire immediately
    }) ;
    return response;
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files and public assets
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
