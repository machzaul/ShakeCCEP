/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Phaser runs better with single mount in game loop
  webpack: (config) => {
    // Treat canvas / phaser safely
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    return config;
  },
};

export default nextConfig;

