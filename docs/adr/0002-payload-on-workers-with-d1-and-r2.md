# Payload on Cloudflare Workers with D1 and R2

The CMS is Payload 3, deployed to Cloudflare Workers via OpenNext, with D1 (SQLite) as its database and R2 for media, so the CMS and the site run on the same platform. This requires the Workers Paid plan ($5/month), because Payload's bundle is larger than the free plan's 3 MB limit.

## Considered Options

- **Postgres (Neon/Supabase) + S3, or Payload hosted outside Cloudflare**: these allow Payload's normal `sharp`-based image sizes, but they mean a second platform and more accounts to run for a one-person blog.

## Consequences

- Workers can't run `sharp`, so Payload doesn't generate image sizes. Images are served from R2 on `media.justfredrik.com`, and `srcset` widths come from Cloudflare Image Transformations (`/cdn-cgi/image/…`). Leaving Cloudflare means replacing that pipeline.
- Moving off D1 is a real data migration through another Payload database adapter, not a config change.
- Post bodies are stored as Payload Lexical JSON with custom Code, Figure and HTML blocks; leaving Payload means converting every Post again.
