import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow xlsx to be bundled (it uses some Node APIs)
  serverExternalPackages: [],
  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
