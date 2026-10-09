import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [{
          protocol: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).protocol.replace(':', '') as 'http' | 'https',
          hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
          pathname: '/storage/v1/object/public/product-images/**'
        }]
      : []
  }
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);


