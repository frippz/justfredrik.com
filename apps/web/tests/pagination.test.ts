import { expect, test, type Page } from '@playwright/test'

const older = (page: Page) => page.locator('.more-articles .older')
const newer = (page: Page) => page.locator('.more-articles .newer')

test('pages through every Post at /pageN/', async ({ page }) => {
  await page.goto('/')
  await expect(newer(page)).toHaveCount(0)
  await expect(older(page)).toHaveText('Older posts')
  await expect(older(page)).toHaveAttribute('href', '/page2/')

  await older(page).click()
  await expect(page).toHaveURL('/page2/')
  await expect(page).toHaveTitle(
    'The personal journal of Fredrik Frodlund – justfredrik.com (page 2)',
  )
  await expect(page.locator('#main-content article')).toHaveCount(5)
  await expect(newer(page)).toHaveText('Newer posts')
  await expect(newer(page)).toHaveAttribute('href', '/')
  await expect(older(page)).toHaveAttribute('href', '/page3/')

  await older(page).click()
  await expect(page).toHaveURL('/page3/')
  await expect(page.locator('#main-content article h2')).toHaveText([
    'Fixture: Hello again',
  ])
  await expect(older(page)).toHaveCount(0)
  await expect(newer(page)).toHaveAttribute('href', '/page2/')

  await newer(page).click()
  await expect(page).toHaveURL('/page2/')
})

test('has no /page1/ and no page past the last', async ({ request }) => {
  expect((await request.get('/page1/')).status()).toBe(404)
  expect((await request.get('/page4/')).status()).toBe(404)
})
