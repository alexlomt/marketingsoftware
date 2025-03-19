// Environment configuration for Render deployment

/**
 * Get environment variables with fallbacks
 * @returns {Object} Environment variables
 */
export function getEnv() {
  return {
    JWT_SECRET: process.env.JWT_SECRET || 'render-development-jwt-secret-key',
    SETUP_KEY: process.env.SETUP_KEY || 'render-setup-key',
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_URL: process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000'
  };
}
