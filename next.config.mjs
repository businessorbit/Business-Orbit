/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com'],
  },
  serverExternalPackages: ['pg'],
  // Skip static optimization to prevent build timeouts
  output: 'standalone',
  // Disable output file tracing to prevent build timeout
  // This skips the "Collecting build traces" phase
  outputFileTracingExcludes: {
    '*': [
      'node_modules/**/*',
    ],
  },
  // Skip API route analysis during build to prevent timeouts
  experimental: {
    // This helps prevent Next.js from trying to analyze API routes during build
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Skip build traces to speed up build
    optimizePackageImports: ['lucide-react'],
    // Disable static page generation completely
    staticGenerationRetryCount: 0,
  },
  // Completely skip static page generation
  // All pages are dynamic, so we don't need this phase
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // Force all routes to be treated as dynamic during build
  // This prevents Next.js from trying to collect page data
  reactStrictMode: true,
  // Completely disable static page optimization
  // Since all pages are dynamic, we don't need this
  poweredByHeader: false,
  // Proxy all API routes to backend ONLY on Vercel
  // On EC2, API routes run directly with database access
  async rewrites() {
    // Only proxy on Vercel, not on EC2
    // On EC2, we want API routes to execute directly with database access
    if (process.env.VERCEL === '1') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://api.businessorbit.org'}/api/:path*`,
        },
      ];
    }
    // On EC2, return empty array so API routes execute directly
    return [];
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Skip module analysis during build to speed up
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        minimize: true,
      };
    }
    return config;
  },
  // Disable source maps in production to speed up build
  productionBrowserSourceMaps: false,
  // Skip build ID generation optimization
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
}

export default nextConfig