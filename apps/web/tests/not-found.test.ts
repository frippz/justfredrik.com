import { expect, test } from '@playwright/test'

test('unknown paths serve the 404 page', async ({ page }) => {
  const response = await page.goto('/no/such/page/')
  expect(response?.status()).toBe(404)

  await expect(page).toHaveTitle('Whoops! Page not found – justfredrik.com')
  await expect(page.locator('.not-found #heading-404')).toHaveText(
    'Whoops! Page not found',
  )
  await expect(
    page.locator('.not-found article .svg-icon use'),
  ).toHaveAttribute('href', '/images/sprite.svg#icon-cloud')
  await expect(page.locator('#header')).toHaveCount(0)

  await page
    .getByRole('link', { name: 'the first page of this website' })
    .click()
  await expect(page).toHaveURL('/')
})

test('the 404 page is built for the host to serve', async ({ request }) => {
  const response = await request.get('/404.html')
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('Whoops! Page not found')
})
