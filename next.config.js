// Production Next.js configuration
module.exports = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Configure image optimization
  images: {
    domains: ['localhost'],
    // Add any other domains you need to load images from
    // For example: 'your-s3-bucket.s3.amazonaws.com'
  },
  
  // Configure environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  
  // Configure build output
  output: 'standalone',
  
  // Disable Edge Runtime for API routes
  experimental: {
    runtime: 'nodejs',
  },
  
  // Configure Node.js packages that should not be bundled
  serverComponentsExternalPackages: [
    'pg',
    'bcryptjs',
    'jsonwebtoken'
  ],
  
  // Configure headers for security and to skip Edge Runtime
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
      },
      {
        // Skip Edge Runtime for API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'x-middleware-preflight',
            value: 'skip'
          }
        ]
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
    
    return config;
  },
};
