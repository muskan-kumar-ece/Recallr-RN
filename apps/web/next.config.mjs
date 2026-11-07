/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@recallr/tokens', '@recallr/core', '@recallr/api'],
};

export default nextConfig;
