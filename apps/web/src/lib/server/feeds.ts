import { postPath } from '#lib/posts'
import { renderPost } from '#lib/body'
import { escapeHtml } from '#lib/body/escape'
import { contentSource } from '#lib/server/content'
import { site } from '#lib/site'

/** frippz.se's `feed-title` */
const feedTitle = `${site.author} – ${site.title}`

/**
 * Every published Post, newest first, with what both feeds need. The id is
 * the Post's absolute URL, as frippz.se's feed templates made it, so feed
 * readers that followed the redirect see old Posts as already read.
 */
async function feedItems() {
  const posts = await contentSource().getPosts()
  return Promise.all(
    posts.map(async (post) => {
      const { html } = await renderPost(post)
      const url = `${site.url}${postPath(post)}`
      return { ...post, html, id: url, url }
    }),
  )
}

/** Atom, as frippz.se's `feed.xml` */
export async function atomFeed() {
  const items = await feedItems()
  const updated = (item: (typeof items)[number]) =>
    item.revisedAt ?? item.publishedAt
  // The newest entry rather than the build time, so a rebuild without content
  // changes leaves the feed as it was
  const feedUpdated =
    items.map(updated).sort().at(-1) ?? new Date(0).toISOString()

  const entries = items.map(
    (item) => `  <entry>
    <title>${escapeHtml(item.title)}</title>
    <link href="${item.url}"/>
    <id>${item.id}</id>
    <updated>${updated(item)}</updated>
    <content type="html">${escapeHtml(item.html)}</content>
  </entry>`,
  )

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:base="${site.url}/">
  <title>${escapeHtml(feedTitle)}</title>
  <link href="${site.url}"/>
  <link href="${site.url}/feed.xml" rel="self"/>
  <updated>${feedUpdated}</updated>
  <author>
    <name>${escapeHtml(site.author)}</name>
  </author>
  <id>${site.url}/</id>
${entries.join('\n')}
</feed>
`
}

/** JSON Feed 1.1, as frippz.se's `feed.json` */
export async function jsonFeed() {
  const items = await feedItems()

  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: feedTitle,
    home_page_url: site.url,
    feed_url: `${site.url}/feed.json`,
    authors: [{ url: site.url, name: site.author, avatar: site.avatar }],
    icon: `${site.url}/apple-touch-icon.png`,
    favicon: `${site.url}/favicon-32x32.png`,
    items: items.map((item) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      summary: item.description,
      date_published: item.publishedAt,
      date_modified: item.revisedAt,
      authors: [{ name: site.author }],
      tags: item.tags.length ? item.tags.map((tag) => tag.name) : undefined,
      content_html: item.html,
    })),
  }
}
