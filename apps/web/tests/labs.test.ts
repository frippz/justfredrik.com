import { expect, test } from '@playwright/test'

const labs = [
  { name: 'animated-map-pin', title: 'Animated map pin' },
  { name: 'highlighted-text', title: 'Highlighted text' },
  { name: 'periodic-system', title: 'Periodic system in an HTML table' },
  {
    name: 'yet-another-circular-progress-bar',
    title: 'Yet another circular progress bar',
  },
]

test('the Labs index links to every Lab', async ({ page }) => {
  await page.goto('/labs/')

  await expect(page).toHaveTitle('Labs – justfredrik.com')
  const links = page.locator('article[aria-labelledby="labs"] li a')
  await expect(links).toHaveText(labs.map(({ title }) => title))
  expect(
    await links.evaluateAll((all) => all.map((a) => a.getAttribute('href'))),
  ).toEqual(labs.map(({ name }) => `/labs/${name}.html`))
})

for (const lab of labs) {
  test(`the ${lab.title} Lab shows its note beside its demo`, async ({
    page,
  }) => {
    const response = await page.goto(`/labs/${lab.name}.html`)
    expect(response?.status()).toBe(200)
    expect(page.url()).toMatch(new RegExp(`/labs/${lab.name}\\.html$`))

    await expect(page).toHaveTitle(
      `${lab.title} – a lab created by Fredrik Frodlund – justfredrik.com`,
    )

    // No site frame
    await expect(page.locator('#header')).toHaveCount(0)
    await expect(page.locator('#footer')).toHaveCount(0)

    const note = page.locator('aside')
    await expect(note.locator('h1')).toHaveText(lab.title)
    await expect(note.locator('p').first()).not.toBeEmpty()
    await expect(
      note.getByRole('link', { name: 'Back to labs' }),
    ).toHaveAttribute('href', '/labs/')

    const iframe = page.locator('#lab-area iframe')
    await expect(iframe).toHaveAttribute(
      'src',
      `/lab-includes/${lab.name}.html`,
    )
    await expect(iframe).toHaveAttribute('title', lab.title)
    await expect(
      page.frameLocator('#lab-area iframe').locator('body > *').first(),
    ).toBeAttached()
  })
}
