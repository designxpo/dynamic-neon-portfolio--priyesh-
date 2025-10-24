/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Allow importing components from the project root during migration
    externalDir: true,
  },
};

module.exports = nextConfig;
