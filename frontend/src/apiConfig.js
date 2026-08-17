// Use relative "/api" so that requests are handled by cPanel PHP API Proxy (same origin, zero CORS issues)
export const API_BASE = "";

// Backend Vercel langsung — untuk upload multipart (proxy PHP cPanel merusak body multipart).
// CORS sudah terbuka di backend (*).
export const VERCEL_BASE = "https://backend-ten-umber-9dbevyts90.vercel.app";
