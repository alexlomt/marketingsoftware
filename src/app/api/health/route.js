// API health check endpoint for Render.com
// This file is required for Render's health checks

import { NextResponse } from 'next/server';

// Counter to see how many times it's hit
let healthCheckCounter = 0;

export async function GET() {
  healthCheckCounter++;
  const timestamp = new Date().toISOString();
  // Add detailed logging
  console.log(`[HEALTH CHECK LOG] Health check endpoint hit (${healthCheckCounter} times) at ${timestamp}`); 

  try {
    // Simple health check that doesn't require database connection
    // Return counter and timestamp in response for potential external checks
    return NextResponse.json(
        { status: 'ok', message: 'Service is healthy', count: healthCheckCounter, timestamp: timestamp }, 
        { status: 200 }
    );
  } catch (error) {
    // Log if the health check itself throws an unexpected error
    console.error('[HEALTH CHECK ERROR] Health check failed unexpectedly:', error); 
    return NextResponse.json(
      { status: 'error', message: 'Service is unhealthy' },
      { status: 500 }
    );
  }
}
