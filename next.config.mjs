/** @type {import('next').NextConfig} */
const nextConfig = {
  javascript: {
    ignoreBuildErrors: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
