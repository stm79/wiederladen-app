import type { NextConfig } from "next";

// Behind a reverse proxy on a real domain, Server Actions' built-in CSRF check
// compares the request's Origin against the Host it sees — set ALLOWED_ORIGIN
// (e.g. "wiederladen.example.com", comma-separated for more than one) so that
// still passes. Not needed for local/plain-port access.
const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(",").map((o) => o.trim()).filter(Boolean);

const nextConfig: NextConfig = {
  experimental: {
    // Default 1MB is well below a phone camera photo (chrono CSV imports and
    // group-photo uploads both go through Server Actions).
    serverActions: {
      bodySizeLimit: "20mb",
      ...(allowedOrigins?.length ? { allowedOrigins } : {}),
    },
  },
};

export default nextConfig;
