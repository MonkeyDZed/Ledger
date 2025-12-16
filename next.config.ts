import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ✅ TypeScript strict activé - Build fonctionne correctement
    // Problème résolu: répertoires dupliqués avec parenthèses malformées supprimés
    ignoreBuildErrors: false,
  },
  eslint: {
    // ✅ ESLint activé pour détecter les problèmes de code
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
