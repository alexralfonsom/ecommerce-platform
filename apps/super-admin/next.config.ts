import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* configs options here */
  basePath: process.env.BASEPATH,
  trailingSlash: false,

  // Configuración de headers para SEO
  async headers() {
    return [
      {
        source: '/(.*)not-found(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

export default withNextIntl(nextConfig);
