import { expect, test, type APIRequestContext } from '@playwright/test'

// Ported from frippz.se's cypress/e2e/vitalPageElements.cy.js

async function sitemapPaths(request: APIRequestContext) {
  const response = await request.get('/sitemap.xml')
  expect(response.ok()).toBe(true)

  const xml = await response.text()
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    ([, loc]) => new URL(loc).pathname,
  )
}

test('every sitemap URL has the vital page elements', async ({
  page,
  request,
}) => {
  const paths = await sitemapPaths(request)
  expect(paths.length).toBeGreaterThan(0)

  // Labs are shown outside the site frame
  for (const path of paths.filter(
    (path) => !path.startsWith('/labs/') || path === '/labs/',
  )) {
    await test.step(path, async () => {
      await page.goto(path)

      await expect(page.locator('#header h1')).toBeVisible()
      await expect(page.locator('#main-nav li')).toHaveCount(3)
      await expect(page.locator('#footer .external-links li')).toHaveCount(4)
      await expect(page.locator('#footer .feeds li')).toHaveCount(3)
    })
  }
})
