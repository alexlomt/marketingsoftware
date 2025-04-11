/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configure image optimization
  images: {
    domains: ['localhost'],
    // Add any other domains you need to load images from
  },
  
  // Configure environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  
  // Configure build output
  output: 'standalone',
  
  // Configure headers for security
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      }
    ];
  },
  
  // Configure webpack for optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size in production
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
      };
    }
    
    // Add fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false
      };
    }
    
    // Ignore warnings for specific modules, but allow Edge Runtime warnings
    config.ignoreWarnings = [
      { module: /node_modules\/bcryptjs/ },
      { module: /node_modules\/jsonwebtoken/ },
      { module: /node_modules\/jws/ },
      { module: /node_modules\/pg/ },
      { module: /node_modules\/pgpass/ },
      // { message: /Edge Runtime/ }, // Temporarily removed to see warnings
    ];
    
    return config;
  },
  
  // Disable experimental features that might cause issues
  experimental: {
    instrumentationHook: false,
  },
}

module.exports = nextConfig
