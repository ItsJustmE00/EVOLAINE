/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Désactiver la vérification TypeScript pendant la construction
  typescript: {
    ignoreBuildErrors: true,
  },
  // Désactiver la vérification ESLint pendant la construction
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuration des en-têtes de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Configuration des redirections
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
  // Configuration des réécritures
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://evolaine-backend.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
