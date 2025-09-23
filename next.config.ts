import { format } from 'date-fns';
import { NextConfig } from 'next';

const nextConfig: NextConfig = {};

const proxy = async () => {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/api/:path*',
    },
  ];
};

// 检查构建目标
const buildTarget = process.env.BUILD_TARGET || 'extension';

switch (process.env.NODE_ENV) {
  case 'production':
    console.log('buildTarget', buildTarget);
    if (buildTarget === 'cloudflare') {
      nextConfig.output = 'standalone';
    } else {
      // 默认为 Chrome 插件构建
      nextConfig.output = 'export';
      nextConfig.images = {};
      nextConfig.images.unoptimized = true;
      nextConfig.distDir = 'dist';
    }
    break;
  case 'development':
    nextConfig.rewrites = proxy;
    break;
}
nextConfig.devIndicators = false;

process.env.NEXT_PUBLIC_BUILD_TIME = format(new Date(), 'yyyy-MM-dd HH:mm');

export default nextConfig;
