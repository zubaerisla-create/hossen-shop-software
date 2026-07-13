/**
 * Centralized API base URL utility.
 * Reads from NEXT_PUBLIC_API_URL env variable; defaults to Vercel production server.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://hossen-software-shop-server.vercel.app/';

/**
 * Centralized Socket.IO server URL.
 * Uses the same base as the API.
 */
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'https://hossen-software-shop-server.vercel.app/';
