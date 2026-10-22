import { site } from '#lib/site'

// Grows as routes land: Posts, Tags, pages, Labs.
const paths = ['/']

export const prerender = true

export function GET() {
  const urls = paths
    .map((path) => `  <url><loc>${site.url}${path}</loc></url>`)
    .join('\n')

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml' } },
  )
}
