This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Performance and CDN

- The home page and product catalog use incremental static regeneration (120 seconds); category pages revalidate every 60 seconds, and product pages every hour. These storefront routes return shared-cache headers so a CDN can serve generated pages without running their Supabase queries for every visitor.
- Product reviews are included in the cached product response. The browser reloads reviews from Supabase only after a customer submits a review.
- Search suggestions and full search results use a server endpoint with a shared 60-second cache; the browser no longer queries Supabase while typing or opening results.
- Product images are resized and encoded as AVIF or WebP by Next.js Image Optimization. Admin uploads are compressed to WebP (up to 1200 px / 0.5 MB) and stored under unique paths with a one-year cache lifetime.
- Vercel provides its CDN automatically. On other hosts, configure the CDN to honor Next.js `Cache-Control` headers, include `q` and `mode` in `/api/search` cache keys, and preserve App Router variants (including `rsc` and `_rsc`). Never shared-cache authenticated admin or account responses.
- These changes reduce repeated page and image work; they do not by themselves certify a specific concurrency target. Validate expected peak traffic with production load tests and ensure the Supabase plan, connection pooling, and database indexes match that load.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# hk1
