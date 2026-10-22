import { expect, test } from '@playwright/test'

test('lists published Posts newest first, without Drafts', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(
    'The personal journal of Fredrik Frodlund – justfredrik.com',
  )

  const headings = page.locator('#main-content article h2')
  await expect(headings).toHaveCount(7)
  await expect(headings.first()).toHaveText(
    'Fixture: Focus styles that respect your brand',
  )
  await expect(headings.last()).toHaveText('Fixture: Hello again')
  await expect(page.getByText('Fixture: Half-written thoughts')).toHaveCount(0)

  await expect(page.locator('article .post-info time').first()).toHaveText(
    'March 14, 2024',
  )
})
