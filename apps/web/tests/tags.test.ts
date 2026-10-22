import { expect, test } from '@playwright/test'

const tagCloud = '#main-content .tag-cloud a'

test('the Tags index lists every Tag used by a published Post', async ({
  page,
}) => {
  await page.goto('/tags/')

  await expect(page).toHaveTitle('Tags & keywords – justfredrik.com')
  await expect(
    page.locator('article[aria-labelledby="tags-keywords"] h2'),
  ).toHaveText('Tags & keywords')

  // Sorted by name, sized by how many Posts use each Tag
  await expect(page.locator(tagCloud)).toHaveText([
    'a11y',
    'animation',
    'browser support',
    'css',
    'custom properties',
    'html',
    'json feed',
    'progressive enhancement',
    'rss',
  ])
  await expect(page.getByRole('link', { name: 'a11y' })).toHaveClass('set-3')
  await expect(page.getByRole('link', { name: 'css' })).toHaveClass('set-5')
  await expect(page.getByRole('link', { name: 'html' })).toHaveClass('set-1')

  await page.getByRole('link', { name: 'browser support' }).click()
  await expect(page).toHaveURL('/tags/browser-support/')
})

test('a Tag page lists its Posts, newest first', async ({ page }) => {
  await page.goto('/tags/a11y/')

  await expect(page).toHaveTitle(
    'Articles tagged with “a11y” – justfredrik.com',
  )
  await expect(page.locator('#main-content h2')).toHaveText(
    'Articles tagged with “a11y”',
  )

  const items = page.locator('#main-content ol > li.tag-item')
  await expect(items.locator('a')).toHaveText([
    'Fixture: Focus styles that respect your brand',
    'Fixture: Accessible footnotes',
    'Fixture: Skip links still matter',
    'Fixture: On styling your anchors',
  ])
  await expect(items.first().locator('small')).toHaveText(
    'Posted on 14th March 2024',
  )
  await expect(items.first().locator('a')).toHaveAttribute(
    'href',
    '/2024/03/14/focus-styles-that-respect-your-brand/',
  )
})

test('every Tag in the cloud has a page', async ({ page, request }) => {
  await page.goto('/tags/')
  const paths = await page
    .locator(tagCloud)
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))

  for (const path of paths) {
    expect((await request.get(path!)).status(), path!).toBe(200)
  }
})

test('a Tag used only by Drafts has no page', async ({ page, request }) => {
  expect((await request.get('/tags/view-transitions/')).status()).toBe(404)

  await page.goto('/tags/')
  await expect(page.getByText('view transitions')).toHaveCount(0)

  // The Draft's other Tag lists only published Posts
  await page.goto('/tags/css/')
  await expect(page.locator('.tag-item')).toHaveCount(7)
  await expect(page.getByText('Half-written thoughts')).toHaveCount(0)
})

test('Posts link to their Tags', async ({ page }) => {
  await page.goto('/2021/01/17/accessible-footnotes/')

  const keywords = page.locator(
    'article footer .post-tags [itemprop="keywords"]',
  )
  await expect(keywords).toHaveText('a11y, html, css')
  await expect(keywords.locator('a[rel="tag"]')).toHaveCount(3)
  await expect(keywords.getByRole('link', { name: 'html' })).toHaveAttribute(
    'href',
    '/tags/html/',
  )

  await keywords.getByRole('link', { name: 'a11y' }).click()
  await expect(page).toHaveURL('/tags/a11y/')
})

test('a Post without Tags has no keywords footer', async ({ page }) => {
  await page.goto('/2014/02/11/hello-again/')
  await expect(page.locator('.post-tags')).toHaveCount(0)
})
