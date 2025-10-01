// Centralized client-side configuration for API and WebSocket base URLs.
// Uses NEXT_PUBLIC_* envs in production and sensible localhost fallbacks for dev.

export const API_BASE: string =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Use a function to safely resolve WS base on the client (guards against SSR eval)
export function getWsBase(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    // Default production domain if env not provided; override via NEXT_PUBLIC_WS_URL
    return 'wss://ws.0xparth.me';
  }
  return 'ws://localhost:8080';
}
