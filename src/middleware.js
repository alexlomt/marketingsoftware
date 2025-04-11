import { NextRequest, NextResponse } from 'next/server';
// Import verifyToken from the new Edge-specific file
import { verifyToken } from './lib/auth-edge'; 

// Removed explicit runtime export, relying on Edge-compatible verifyToken
// export const runtime = 'nodejs'; 

/**
 * Middleware to handle authentication and authorization
 */
export async function middleware(request) { // Made middleware async
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

  // Verify token (using jose via auth-edge.js, is async)
  let payload = null; // Initialize payload
  try {
    payload = await verifyToken(authToken); // Uses verifyToken from auth-edge.js
  } catch (error) {
    // verifyToken should ideally handle its own errors and return null,
    // but catch unexpected errors just in case.
    console.error('Unexpected error during token verification in middleware:', error);
    payload = null; 
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
  requestHeaders.set('x-user-id', String(payload.id)); // Ensure value is string
  if (payload.role) {
      requestHeaders.set('x-user-role', String(payload.role)); // Ensure value is string
  }
  if (payload.organization_id) { // Only set if organization_id exists
      requestHeaders.set('x-organization-id', String(payload.organization_id)); // Ensure value is string
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
