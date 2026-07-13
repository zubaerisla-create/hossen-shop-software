/**
 * Centralized API base URL utility.
 * Reads from NEXT_PUBLIC_API_URL env variable with a localhost fallback for development.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Centralized Socket.IO server URL.
 * Uses the same base as the API (without /api path).
 */
export const SOCKET_URL = API_BASE_URL;
