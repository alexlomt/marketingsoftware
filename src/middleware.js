import { NextRequest, NextResponse } from 'next/server';
// Import verifyToken from the new Edge-specific file
import { verifyToken } from './lib/auth-edge'; 

// Removed explicit runtime export, relying on Edge-compatible verifyToken
// export const runtime = 'nodejs'; 

/**
 * Middleware to handle authentication and authorization
 */
export async function middleware(request) { // Made middleware async
  const pathname = request.nextUrl.pathname;
  console.log(`[MW LOG] Middleware invoked for path: ${pathname}`);

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
    pathname === route || pathname.startsWith(route + '/')
  );

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    console.log(`[MW LOG] Path ${pathname} is public. Allowing.`);
    return NextResponse.next();
  }

  // Get auth token from cookie
  const authToken = request.cookies.get('auth_token')?.value;

  // If no token is present, handle differently for API vs page requests
  if (!authToken) {
    console.log(`[MW LOG] No auth token found for path: ${pathname}`);
    if (pathname.startsWith('/api/')) {
      console.log(`[MW LOG] Returning 401 for API path.`);
      // For API routes, return unauthorized error
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    } else {
      // For page routes, redirect to login
      console.log(`[MW LOG] Redirecting to login for page path.`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Verify token (using jose via auth-edge.js, is async)
  let payload = null; // Initialize payload
  try {
    console.log(`[MW LOG] Verifying token for path: ${pathname}`);
    payload = await verifyToken(authToken); // Uses verifyToken from auth-edge.js
    console.log(`[MW LOG] Token verification result for ${pathname}:`, payload ? `Valid (User ID: ${payload.id})` : 'Invalid/Expired');
  } catch (error) {
    // verifyToken should ideally handle its own errors and return null,
    // but catch unexpected errors just in case.
    console.error(`[MW ERROR] Unexpected error during token verification for ${pathname}:`, error);
    payload = null; 
  }

  // If token is invalid or expired, handle differently for API vs page requests
  if (!payload) {
    console.log(`[MW LOG] Invalid/Expired token for path: ${pathname}`);
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    // Clear the invalid cookie
    console.log(`[MW LOG] Clearing auth_token cookie.`);
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

  // --- Role Check (unchanged) ---
  const adminApiRoutes = ['/api/admin/', '/api/setup/']; 
  const adminPageRoutes = ['/admin/'];
  const isAdminApiRoute = adminApiRoutes.some(route => pathname.startsWith(route));
  const isAdminPageRoute = adminPageRoutes.some(route => pathname.startsWith(route));
  if ((isAdminApiRoute || isAdminPageRoute) && payload.role !== 'admin') {
      console.log(`[MW LOG] Access denied (Admin required) for path: ${pathname}`);
      if (isAdminApiRoute) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      } else {
          return NextResponse.redirect(new URL('/dashboard', request.url));
      }
  }
  // --- End Role Check --- 

  // Add user info to request headers for use in API routes and page components
  console.log(`[MW LOG] Adding user headers for path: ${pathname}`);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(payload.id)); // Ensure value is string
  if (payload.role) {
      requestHeaders.set('x-user-role', String(payload.role)); // Ensure value is string
  }
  if (payload.organization_id) { // Only set if organization_id exists
      requestHeaders.set('x-organization-id', String(payload.organization_id)); // Ensure value is string
  }

  // Continue with the request, adding the modified headers
  console.log(`[MW LOG] Forwarding request with added headers for path: ${pathname}`);
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
