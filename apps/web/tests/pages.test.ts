import { expect, test } from '@playwright/test'

test('the About page introduces the author without the old platform', async ({
  page,
}) => {
  await page.goto('/about/')

  await expect(page).toHaveTitle(
    'About the author of this journal – justfredrik.com',
  )
  const article = page.locator(
    'article[aria-labelledby="about-the-author-of-this-journal"]',
  )
  await expect(article.locator('h2')).toHaveText(
    'About the author of this journal',
  )
  await expect(article.locator('#technical-stuff')).toBeVisible()

  const photo = article.locator('img.left')
  await expect(photo).toHaveAttribute('src', '/images/just-me-320w.jpg')
  await expect(photo).toHaveAttribute('srcset', /just-me-480w\.jpg 480w/)
  await expect(photo).toHaveAttribute('srcset', /just-me-640w\.jpg 640w/)
  expect(
    await photo.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBe(320)

  await expect(article).not.toContainText('Jekyll')
  await expect(article).not.toContainText('Cloudflare Pages')
  await expect(article).toContainText('SvelteKit')
})

test('the Grid page shows its figures and highlighted markup', async ({
  page,
}) => {
  await page.goto('/grid/')

  await expect(page).toHaveTitle(
    'Stuff for the CSS Grid Layout lab – justfredrik.com',
  )
  await expect(
    page.locator('#lab-1---header-two-columns-and-a-footer'),
  ).toBeVisible()

  const images = page.locator('#main-content figure.image img')
  await expect(images).toHaveCount(7)
  for (const img of await images.all()) {
    await img.scrollIntoViewIfNeeded()
    await expect(img).toHaveAttribute('src', /^\/images\/grid\//)
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0)
  }

  await expect(
    page.locator('#main-content .language-html pre.highlight'),
  ).toHaveCount(5)

  await page.getByText('Show me!').click()
  await expect(
    page.getByRole('link', { name: 'https://gridbyexample.com/patterns/' }),
  ).toBeVisible()
})

test('no page loads images from imgur', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    ([, loc]) => new URL(loc).pathname,
  )
  expect(paths).toContain('/grid/')

  for (const path of paths) {
    const html = await (await request.get(path)).text()
    const imgur = html.match(/<img[^>]*imgur\.com[^>]*>/g) ?? []
    expect(imgur, path).toEqual([])
  }
})
