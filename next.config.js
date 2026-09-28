/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double API calls in development
  // Disable web vitals to prevent startTime errors
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    instrumentationHook: true, // Enable instrumentation to suppress errors
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Disable CSS preloading warnings in development
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 60,
  },
  // Optimize webpack for CSS handling and disable web vitals
  webpack: (config, { dev, isServer }) => {
    // Suppress preload warnings in development
    if (dev && !isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        return entries;
      };
    }

    // Disable web vitals by aliasing to an empty module
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/dist/client/web-vitals': false,
      'next/dist/shared/lib/utils': false,
    };
    
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://translate.googleapis.com https://www.gstatic.com https://*.gstatic.com; img-src 'self' data: https: http: blob:; font-src 'self' data: https://translate.googleapis.com https://www.gstatic.com https://*.gstatic.com; connect-src 'self' http://localhost:5000 https://*.supabase.co wss://*.supabase.co https://*.railway.app https://*.onrender.com https://translate.googleapis.com https://translate-pa.googleapis.com; frame-src https://translate.google.com https://translate.googleapis.com 'self';"
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*).png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*).jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
