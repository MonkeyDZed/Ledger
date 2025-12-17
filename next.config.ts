import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // ✅ Output standalone pour Electron - génère un serveur autonome
  output: 'standalone',

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
    // ✅ Configuration pour Electron - pas de domaines externes en local
    unoptimized: true,
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
  // ✅ Optimisations pour production Electron
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
