import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!configuredUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is required to generate robots.txt.');
  }
  const siteUrl = new URL(configuredUrl).origin;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login'],
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
  };
}
