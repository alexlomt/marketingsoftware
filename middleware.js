// middleware.js
import { NextResponse } from 'next/server';

// This middleware will run for all routes
export function middleware(request) {
  // Return NextResponse.next() to continue to the requested page
  return NextResponse.next();
}

// Configure middleware to run only for specific paths
export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    '/((?!_next|api).*)',
  ],
};
