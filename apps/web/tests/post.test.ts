import { expect, test, type APIRequestContext } from '@playwright/test'

async function sitemapPaths(request: APIRequestContext) {
  const xml = await (await request.get('/sitemap.xml')).text()
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    ([, loc]) => new URL(loc).pathname,
  )
}

test('every Post is reachable at its date and slug path', async ({
  page,
  request,
}) => {
  const postPaths = (await sitemapPaths(request)).filter((path) =>
    /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/.test(path),
  )
  expect(postPaths).toHaveLength(11)

  // Every Post on the index pages links to one of those paths
  const linked: string[] = []
  for (const indexPath of ['/', '/page2/', '/page3/']) {
    await page.goto(indexPath)
    linked.push(
      ...(await page
        .locator('article h2 a')
        .evaluateAll((links) =>
          links.map((link) => link.getAttribute('href') ?? ''),
        )),
    )
  }
  expect(linked.toSorted()).toEqual(postPaths.toSorted())

  for (const path of postPaths) {
    expect((await request.get(path)).status(), path).toBe(200)
  }
})

test('shows a Post with BlogPosting microdata and social meta', async ({
  page,
}) => {
  const path = '/2017/05/18/print-stylesheets/'
  await page.goto(path)

  await expect(page).toHaveTitle('Fixture: Print stylesheets – justfredrik.com')

  const article = page.locator(
    'article[itemtype="http://schema.org/BlogPosting"]',
  )
  await expect(article).toHaveAttribute('id', 'fixture-print-stylesheets')
  await expect(article.locator('h2[itemprop="headline"]')).toHaveText(
    'Fixture: Print stylesheets',
  )
  await expect(article.locator('.post-info')).toHaveText(
    'Posted on May 18, 2017',
  )
  await expect(
    article.locator('time[itemprop="datePublished"]'),
  ).toHaveAttribute('datetime', '2017-05-18')
  await expect(article.locator('meta[itemprop="url"]').last()).toHaveAttribute(
    'content',
    `https://justfredrik.com${path}`,
  )
  await expect(article.locator('.article-end')).toHaveCount(0)

  const head = page.locator('head')
  await expect(head.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://justfredrik.com${path}`,
  )
  await expect(head.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary',
  )
  await expect(head.locator('meta[name="twitter:title"]')).toHaveAttribute(
    'content',
    'Fixture: Print stylesheets – justfredrik.com',
  )
  await expect(
    head.locator('meta[name="twitter:description"]'),
  ).toHaveAttribute('content', 'Paper is a medium too.')
})

test('Drafts never appear on any page', async ({ page, request }) => {
  const draftPath = '/2024/05/01/half-written-thoughts-on-view-transitions/'
  expect((await request.get(draftPath)).status()).toBe(404)

  const paths = await sitemapPaths(request)
  expect(paths).not.toContain(draftPath)

  for (const path of paths) {
    await page.goto(path)
    await expect(page.getByText('Half-written thoughts'), path).toHaveCount(0)
  }
})
