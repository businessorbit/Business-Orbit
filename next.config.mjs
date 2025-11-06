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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

export default nextConfig