import { expect, test } from '@playwright/test'

const path = '/2023/11/02/a-circular-progress-bar-in-plain-css/'

test('renders inline formatting, headings, lists and quotes', async ({
  page,
}) => {
  await page.goto(path)
  const body = page.locator('[itemprop="articleBody"]')

  const intro = body.locator('p').first()
  await expect(intro.locator('em')).toHaveText('no')
  await expect(intro.locator('strong')).toHaveText('just')
  await expect(intro.locator('> code')).toHaveText('conic-gradient()')
  await expect(intro.getByRole('link', { name: 'MDN' })).toHaveAttribute(
    'href',
    'https://developer.mozilla.org/en-US/docs/Web/CSS/conic-gradient',
  )

  await expect(body.locator('h3')).toHaveText(['The markup', 'The CSS'])
  await expect(body.locator('h3').first()).toHaveAttribute('id', 'the-markup')
  await expect(body.locator('h4')).toHaveText('Browser support')

  // The nested list sits inside its parent item
  await expect(body.locator('ul > li')).toHaveCount(3)
  await expect(body.locator('ul > li').nth(1).locator('ol > li')).toHaveText([
    'Desktop',
    'Android',
  ])

  await expect(body.locator('blockquote > p')).toHaveText(
    'Support is not a binary choice.',
  )
})

test('highlights code blocks with line numbers and no JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(path)

  const blocks = page.locator('.highlighter-rouge pre.highlight')
  await expect(blocks).toHaveCount(4)

  const css = page.locator('.language-css pre')
  await expect(css.locator('code')).toContainText('border-radius: 50%;')
  // Comments get frippz.se's comment colour
  await expect(css.getByText('/* Fill the circle up to --value */')).toHaveCSS(
    'color',
    'rgb(127, 159, 127)',
  )
  // Code blocks stay dark in both colour schemes
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme })
    const background = await css.evaluate(
      (pre) => getComputedStyle(pre).backgroundColor,
    )
    const [r, g, b] = background.match(/\d+/g)!.map(Number)
    expect(Math.max(r, g, b), colorScheme).toBeLessThan(64)
  }

  // One CSS-counted line number per line
  const lineNumbers = css.locator('.ln > span')
  await expect(lineNumbers).toHaveCount(5)
  expect(
    await lineNumbers
      .last()
      .evaluate((span) => getComputedStyle(span, '::before').content),
  ).toBe('counter(linenumber)')
  await expect(css.locator('.ln')).toHaveAttribute('aria-hidden', 'true')
  await expect(css.locator('.ln')).toBeVisible()

  const plain = page.locator('.language-plaintext code')
  await expect(plain).toHaveText('No highlighting <here>\n')
  await expect(plain.locator('span')).toHaveCount(0)

  await context.close()
})

test('renders Figures with a srcset, a caption and a link', async ({
  page,
}) => {
  await page.goto(path)
  const figures = page.locator('figure.image')
  await expect(figures).toHaveCount(2)

  const linked = figures.first()
  await expect(linked.locator('> a')).toHaveAttribute(
    'href',
    'https://codepen.io/frippz',
  )
  const image = linked.locator('img')
  await expect(image).toHaveAttribute(
    'alt',
    'A circular progress bar at 42 percent',
  )
  await expect(image).toHaveAttribute('loading', 'lazy')
  await expect(image).toHaveAttribute(
    'src',
    'https://media.justfredrik.com/progress-bar.png',
  )
  const srcset = await image.getAttribute('srcset')
  expect(srcset?.split(', ')).toEqual(
    [320, 640, 960, 1280, 1600].map(
      (width) =>
        `https://media.justfredrik.com/cdn-cgi/image/width=${width},format=auto/progress-bar.png ${width}w`,
    ),
  )
  await expect(linked.locator('figcaption')).toHaveText(
    'The finished bar, as seen on CodePen',
  )
  await expect(
    linked.locator('figcaption').getByRole('link', { name: 'CodePen' }),
  ).toBeVisible()

  // Small images are never upscaled, and captions are optional
  const small = figures.last()
  await expect(small.locator('img')).toHaveAttribute(
    'srcset',
    /320w, \S+ 400w$/,
  )
  await expect(small.locator('figcaption')).toHaveCount(0)
  await expect(small.locator('a')).toHaveCount(0)
})

test('writes HTML blocks out as-is', async ({ page }) => {
  await page.goto(path)
  await expect(
    page.locator('[itemprop="articleBody"] table.fixture-html-block td'),
  ).toHaveText('Raw HTML')
})

test('shows full Post bodies on the index pages', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.locator('article').nth(1).locator('.language-css'),
  ).toBeVisible()
})
