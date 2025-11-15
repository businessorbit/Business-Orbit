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
  serverExternalPackages: ['pg', 'dotenv'],
  // Experimental features
  experimental: {
    // This helps prevent Next.js from trying to analyze API routes during build
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize package imports to reduce build time
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },
  // Exclude unnecessary files from build tracing to speed up build
  // This prevents Next.js from analyzing these files during "Collecting build traces" phase
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/**/*',
      'node_modules/.cache/**/*',
      'node_modules/.bin/**/*',
      'node_modules/**/*.md',
      'node_modules/**/*.txt',
      'node_modules/**/*.map',
      '.git/**/*',
      '*.md',
      '*.txt',
      '*.log',
      'scripts/**/*',
      'types/**/*',
      'ecosystem.config.js',
      'temp_ecosystem.js',
      'lib/database/**/*.sql',
      'server/**/*',
    ],
  },
  // Optimize static page generation
  generateBuildId: async () => {
    // Use a simple build ID to speed up build
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },
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
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Client-side: exclude Node.js built-in modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
    }
    // Server-side: externalize Node.js modules
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pg': 'commonjs pg',
        'pg-native': 'commonjs pg-native',
        'dotenv': 'commonjs dotenv',
      });
    }
    return config;
  },
  // Reduce build time by limiting what gets traced
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

export default nextConfig