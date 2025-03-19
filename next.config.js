// Next.js configuration for Render deployment

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'render-development-jwt-secret-key',
    SETUP_KEY: process.env.SETUP_KEY || 'render-setup-key',
  },
};

module.exports = nextConfig;
