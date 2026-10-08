import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Keep framework configuration minimal until store features need it.
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
