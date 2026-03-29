import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse v1 loads test fixtures at module init which fails in Next.js bundling.
  // Marking it as a server-external package prevents bundling and uses Node require() at runtime.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
