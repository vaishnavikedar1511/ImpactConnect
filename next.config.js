/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration for Contentstack
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.contentstack.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.contentstack.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'eu-images.contentstack.io',
        pathname: '/**',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable typed routes (optional)
    typedRoutes: false,
  },
};

module.exports = nextConfig;
