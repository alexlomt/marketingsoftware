// Edge-compatible authentication functions using jose

import * as jose from 'jose'; 
import { getEnv } from './env';

const env = getEnv();

// Prepare the JWT secret for jose (needs to be Uint8Array)
const jwtSecretString = env.JWT_SECRET;
if (!jwtSecretString) {
  throw new Error('JWT_SECRET environment variable is not set.');
}
const jwtSecret = new TextEncoder().encode(jwtSecretString);
const alg = 'HS256'; // Algorithm used for signing

/**
 * Generate a JWT token using jose (Edge Runtime Compatible)
 * @param {Object} payload - Token payload
 * @param {string} [expiresIn] - Token expiration time (e.g., '7d', '2h'). Defaults to env.JWT_EXPIRES_IN or '7d'.
 * @returns {Promise<string>} JWT token
 */
export async function generateToken(payload, expiresIn) {
  const expirationTime = expiresIn || env.JWT_EXPIRES_IN || '7d';
  
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    // .setIssuer('urn:example:issuer') // Optional: Add issuer
    // .setAudience('urn:example:audience') // Optional: Add audience
    .setExpirationTime(expirationTime)
    .sign(jwtSecret);
}

/**
 * Verify a JWT token using jose (Edge Runtime Compatible)
 * @param {string} token - JWT token
 * @returns {Promise<Object|null>} Token payload or null if invalid/expired
 */
export async function verifyToken(token) {
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jose.jwtVerify(token, jwtSecret, {
      // algorithms: [alg], // Optional: Specify algorithms
      // issuer: 'urn:example:issuer', // Optional: Validate issuer if set during generation
      // audience: 'urn:example:audience', // Optional: Validate audience if set during generation
    });
    // jwtVerify throws if invalid/expired, so if we reach here, it's valid
    return payload; 
  } catch (error) {
    // console.error('Token verification failed:', error.message);
    if (error instanceof jose.errors.JWTExpired) {
      console.log('Token expired');
    } else if (error instanceof jose.errors.JOSEError) {
      console.log('Token verification error:', error.code, error.message);
    } else {
      console.error('Unexpected error during token verification:', error);
    }
    return null;
  }
}
