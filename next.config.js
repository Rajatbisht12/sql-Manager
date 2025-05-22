/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during production builds for now
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 