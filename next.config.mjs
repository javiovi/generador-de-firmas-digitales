/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: [
      'cdn-icons-png.flaticon.com', 
      'placehold.co',
      'public.blob.vercel-storage.com',
      'lfqxvvbcxvwfvvvnxvxl.supabase.co',
      'vercel-blob.com',
      'blob.vercel-storage.com',
      'vercel-storage.com',
      'vercel-blob-storage.com',
      'blob.vercel.app'
    ],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Solo permitimos los módulos de Node.js en el servidor
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        crypto: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

export default nextConfig;
