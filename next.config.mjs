/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基础配置
  reactStrictMode: true,
  
  // 图片优化配置
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 性能优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 输出配置
  output: 'standalone',
  
  // 页面扩展名
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // Webpack配置
  webpack: (config) => {
    // 添加SVG支持
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // 类型检查配置
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint配置
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig; 