import { pageCount, pagePath, postPath } from '#lib/posts'
import { contentSource } from '#lib/server/content'
import { site } from '#lib/site'
import { tagCloud, tagPath } from '#lib/tags'

export const prerender = true

// Grows as routes land: About, Grid and the Labs (#257).
export async function GET() {
  const posts = await contentSource().getPosts()
  const totalPages = pageCount(posts)
  const paths = [
    ...Array.from({ length: totalPages }, (_, i) => pagePath(i + 1)),
    ...posts.map(postPath),
    '/tags/',
    ...tagCloud(posts).map(({ tag }) => tagPath(tag)),
  ]

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
