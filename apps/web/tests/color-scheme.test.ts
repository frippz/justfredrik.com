import { expect, test } from '@playwright/test'

// The values of --body-background in css/variables.css
const backgrounds = {
  light: 'rgb(246, 243, 234)',
  dark: 'rgb(39, 39, 38)',
} as const

for (const [colorScheme, background] of Object.entries(backgrounds)) {
  test(`follows the OS ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: colorScheme as 'light' | 'dark' })
    await page.goto('/')

    await expect(page.locator('body')).toHaveCSS('background-color', background)
  })
}
