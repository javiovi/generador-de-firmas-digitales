/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['cdn-icons-png.flaticon.com', 'placehold.co'],
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
