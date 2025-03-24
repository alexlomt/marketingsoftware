// This file ensures database API routes use Node.js runtime instead of Edge Runtime
export const runtime = 'nodejs';
export async function GET(request) {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
