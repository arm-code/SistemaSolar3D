/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimizaciones de build
  webpack: (config, { isServer }) => {
    config.externals.push('canvas', 'jsdom');
    return config;
  },
  // Configurar static generation
  staticPageGenerationTimeout: 120,
};

exports = nextConfig;