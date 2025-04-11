import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Force the middleware to run in the Node.js runtime
export const runtime = 'nodejs';

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
    '/api/health',
    '/api/forms/public' // Add public form submission route
  ];

  // Check if the current path is a public route or a sub-path of a public route
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
  );

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get auth token from cookie
  const authToken = request.cookies.get('auth_token')?.value;

  // If no token is present, handle differently for API vs page requests
  if (!authToken) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      // For API routes, return unauthorized error
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    } else {
      // For page routes, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Verify token
  let payload;
  try {
    payload = verifyToken(authToken);
  } catch (error) {
    console.error('Token verification error:', error);
    payload = null; // Ensure payload is null if verification fails
  }

  // If token is invalid or expired, handle differently for API vs page requests
  if (!payload) {
    const response = request.nextUrl.pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    // Clear the invalid cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0 // Expire immediately
    });
    return response;
  }

  // Check role-based access for admin-only routes
  const adminApiRoutes = ['/api/admin/', '/api/setup/']; // Add setup route as admin
  const adminPageRoutes = ['/admin/'];

  const isAdminApiRoute = adminApiRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  const isAdminPageRoute = adminPageRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if ((isAdminApiRoute || isAdminPageRoute) && payload.role !== 'admin') {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Add user info to request headers for use in API routes and page components (via getServerSideProps/React Server Components)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.id);
  requestHeaders.set('x-user-role', payload.role);
  if (payload.organization_id) { // Only set if organization_id exists
      requestHeaders.set('x-organization-id', payload.organization_id);
  }

  // Continue with the request, adding the modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files and specific public assets
    '/((?!_next/static|_next/image|favicon.ico|logo.png|images/).*)',
  ],
};
