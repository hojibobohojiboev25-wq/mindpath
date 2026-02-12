/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Keep local Next.js API routes as default behavior.
    // Optional proxy is available only when explicitly enabled.
    if (process.env.USE_BACKEND_PROXY !== 'true') {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL || 'http://localhost:3001/api/:path*',
      },
    ]
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig