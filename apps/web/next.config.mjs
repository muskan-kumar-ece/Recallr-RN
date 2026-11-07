/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@recallr/tokens', '@recallr/core', '@recallr/api'],
};

export default nextConfig;
