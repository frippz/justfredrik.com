import { expect, test } from '@playwright/test'

const siteUrl = 'https://justfredrik.com'
const publishedPosts = 11
const draftTitle = 'Half-written thoughts on view transitions'

// Ported from frippz.se's cypress/e2e/checkFeeds.cy.js. The links are
// absolute to the live site, so their paths are requested from the build.
test('every feed linked from the head responds', async ({ page, request }) => {
  await page.goto('/')
  const hrefs = await page
    .locator('head link[rel="alternate"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!))
  expect(hrefs).toEqual([`${siteUrl}/feed.json`, `${siteUrl}/feed.xml`])

  for (const href of hrefs) {
    const { pathname } = new URL(href)
    expect((await request.get(pathname)).status(), pathname).toBe(200)
  }
})

test('the Atom feed has every published Post in full', async ({
  page,
  request,
}) => {
  const response = await request.get('/feed.xml')
  expect(response.headers()['content-type']).toContain('xml')
  const xml = await response.text()
  expect(xml).not.toContain(draftTitle)

  // Parse it in the browser, which reports malformed XML as a parsererror
  await page.goto('/')
  const feed = await page.evaluate((xml) => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    const text = (parent: ParentNode, selector: string) =>
      parent.querySelector(`:scope > ${selector}`)?.textContent
    return {
      error: doc.querySelector('parsererror')?.textContent,
      namespace: doc.documentElement.namespaceURI,
      title: text(doc.documentElement, 'title'),
      id: text(doc.documentElement, 'id'),
      updated: text(doc.documentElement, 'updated'),
      author: text(doc.documentElement, 'author > name'),
      entries: [...doc.querySelectorAll('entry')].map((entry) => ({
        title: text(entry, 'title'),
        id: text(entry, 'id'),
        link: entry.querySelector(':scope > link')?.getAttribute('href'),
        updated: text(entry, 'updated'),
        contentType: entry
          .querySelector(':scope > content')
          ?.getAttribute('type'),
        content: text(entry, 'content'),
      })),
    }
  }, xml)

  expect(feed.error).toBeUndefined()
  expect(feed).toMatchObject({
    namespace: 'http://www.w3.org/2005/Atom',
    title: 'Fredrik Frodlund – justfredrik.com',
    id: `${siteUrl}/`,
    updated: '2024-03-14T08:00:00.000Z',
    author: 'Fredrik Frodlund',
  })
  expect(feed.entries).toHaveLength(publishedPosts)

  // Ids follow frippz.se's: the Post's absolute URL
  expect(feed.entries[0]).toMatchObject({
    title: 'Fixture: Focus styles that respect your brand',
    id: `${siteUrl}/2024/03/14/focus-styles-that-respect-your-brand/`,
    link: `${siteUrl}/2024/03/14/focus-styles-that-respect-your-brand/`,
    updated: '2024-03-14T08:00:00.000Z',
    contentType: 'html',
  })
  for (const entry of feed.entries) {
    expect(entry.id).toBe(entry.link)
    expect(entry.id).toMatch(
      /^https:\/\/justfredrik\.com\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/,
    )
  }

  // The updated date wins over the publish date
  const revised = feed.entries.find(
    ({ title }) => title === 'Fixture: Feeds are not dead',
  )
  expect(revised?.updated).toBe('2020-02-01T12:00:00.000Z')

  // Full content, with every block rendered
  const everyBlock = feed.entries.find(
    ({ title }) => title === 'Fixture: A circular progress bar in plain CSS',
  )
  expect(everyBlock?.content).toContain('<code>conic-gradient()</code>')
  expect(everyBlock?.content).toContain('<pre class="highlight">')
  expect(everyBlock?.content).toContain('<figure class="image">')
})

test('the JSON Feed has every published Post in full', async ({ request }) => {
  const response = await request.get('/feed.json')
  expect(response.headers()['content-type']).toContain('json')
  const feed = await response.json()
  expect(JSON.stringify(feed)).not.toContain(draftTitle)

  expect(feed).toMatchObject({
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Fredrik Frodlund – justfredrik.com',
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/feed.json`,
  })
  expect(feed.items).toHaveLength(publishedPosts)

  expect(feed.items[0]).toEqual({
    id: `${siteUrl}/2024/03/14/focus-styles-that-respect-your-brand/`,
    url: `${siteUrl}/2024/03/14/focus-styles-that-respect-your-brand/`,
    title: 'Fixture: Focus styles that respect your brand',
    summary: 'Making keyboard focus visible without fighting the design.',
    date_published: '2024-03-14T08:00:00.000Z',
    authors: [{ name: 'Fredrik Frodlund' }],
    tags: ['a11y', 'css'],
    content_html:
      '<p>Making keyboard focus visible without fighting the design.</p>',
  })

  const byTitle = (title: string) =>
    feed.items.find((item: { title: string }) => item.title === title)
  expect(byTitle('Fixture: Feeds are not dead').date_modified).toBe(
    '2020-02-01T12:00:00.000Z',
  )
  expect(byTitle('Fixture: Hello again')).not.toHaveProperty('tags')
  expect(
    byTitle('Fixture: A circular progress bar in plain CSS').content_html,
  ).toContain('<figure class="image">')
})
