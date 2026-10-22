import { expect, test } from '@playwright/test'

test('shows the five latest Posts newest first', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(
    'The personal journal of Fredrik Frodlund – justfredrik.com',
  )

  const headings = page.locator('#main-content article h2')
  await expect(headings).toHaveText([
    'Fixture: Focus styles that respect your brand',
    'Fixture: A circular progress bar in plain CSS',
    'Fixture: Dark mode with a single media query',
    'Fixture: The lobotomized owl, ten years later',
    'Fixture: Accessible footnotes',
  ])

  await expect(page.locator('article .post-info time').first()).toHaveText(
    'March 14, 2024',
  )

  // A divider between Posts, but not after the last one
  await expect(page.locator('article .article-end')).toHaveCount(4)
  await expect(
    page.locator('article').last().locator('.article-end'),
  ).toHaveCount(0)
})

test('links each heading to its Post', async ({ page }) => {
  await page.goto('/')

  await page
    .getByRole('link', {
      name: 'Fixture: Focus styles that respect your brand',
    })
    .click()
  await expect(page).toHaveURL(
    '/2024/03/14/focus-styles-that-respect-your-brand/',
  )
})
