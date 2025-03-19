'use server'

// Simple counter functions to replace the ones that use Cloudflare
export async function getStats() {
  // In a real app, this would fetch from a database
  // For demo purposes, we'll return mock data
  return { 
    count: 0, 
    recentAccess: [
      { accessed_at: new Date().toISOString() }
    ] 
  };
}

export async function incrementAndLog() {
  // In a real app, this would update a database
  // For demo purposes, we'll return mock data
  return { 
    count: 1, 
    recentAccess: [
      { accessed_at: new Date().toISOString() },
      { accessed_at: new Date(Date.now() - 60000).toISOString() }
    ] 
  };
}
