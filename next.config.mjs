/** @type {import('next').NextConfig} */
const nextConfig = {
  // Тонкий образ: только рантайм-зависимости вместо всего node_modules
  output: "standalone",

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
