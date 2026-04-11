const path = require('path');

const isDocker = process.env.DOCKER_BUILD === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for Docker deploys (Coolify / VPS).
  output: 'standalone',
  // When building under pnpm workspaces on the host we need to pin the
  // tracing root to the monorepo root so workspace symlinks are followed.
  // In Docker the landing is built in isolation so we skip this.
  ...(isDocker ? {} : { outputFileTracingRoot: path.join(__dirname, '../../') }),
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

module.exports = nextConfig;
