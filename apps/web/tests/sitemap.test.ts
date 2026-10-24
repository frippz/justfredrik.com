import { expect, test } from '@playwright/test'

const siteUrl = 'https://justfredrik.com'

test('the sitemap lists every public page and no Drafts', async ({
  request,
}) => {
  const response = await request.get('/sitemap.xml')
  expect(response.headers()['content-type']).toContain('xml')
  const locs = [...(await response.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(
    ([, loc]) => loc,
  )

  expect(locs.every((loc) => loc.startsWith(`${siteUrl}/`))).toBe(true)
  const paths = locs.map((loc) => new URL(loc).pathname)
  expect(new Set(paths).size).toBe(paths.length)

  expect(paths).toEqual(expect.arrayContaining(['/', '/page2/', '/page3/']))
  expect(paths.filter((path) => /^\/page\d+\/$/.test(path))).toHaveLength(2)
  expect(
    paths.filter((path) => /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/.test(path)),
  ).toHaveLength(11)
  expect(paths).toContain('/tags/')
  expect(paths.filter((path) => /^\/tags\/[^/]+\/$/.test(path))).toHaveLength(9)
  expect(paths).toEqual(expect.arrayContaining(['/about/', '/grid/', '/labs/']))
  expect(
    paths.filter((path) => /^\/labs\/[^/]+\.html$/.test(path)),
  ).toHaveLength(4)
  expect(paths.some((path) => path.includes('404'))).toBe(false)
  expect(paths).not.toContain('/preview/')

  expect(paths.some((path) => path.includes('half-written-thoughts'))).toBe(
    false,
  )
  expect(paths).not.toContain('/tags/view-transitions/')
})

test('robots.txt points to the sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt')
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain(`Sitemap: ${siteUrl}/sitemap.xml`)
})
