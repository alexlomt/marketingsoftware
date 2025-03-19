// API health check endpoint for Render.com
// This file is required for Render's health checks

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple health check that doesn't require database connection
    return NextResponse.json({ status: 'ok', message: 'Service is healthy' }, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'error', message: 'Service is unhealthy' },
      { status: 500 }
    );
  }
}
