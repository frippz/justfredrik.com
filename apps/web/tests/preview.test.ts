import { expect, test, type Page, type Request } from '@playwright/test'

// Plays Payload's admin: a page on the CMS's origin frames /preview/ and posts
// it the Post being edited, as Live Preview does

const cmsOrigin = 'https://cms.justfredrik.com'

// Chrome refuses to let a public origin frame localhost, which only the test does
test.use({
  launchOptions: { args: ['--disable-features=LocalNetworkAccessChecks'] },
})
const previewUrl = 'http://localhost:4173/preview/?id=7'

const text = (content: string) => ({
  type: 'text',
  version: 1,
  text: content,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
})

const paragraph = (content: string) => ({
  type: 'paragraph',
  version: 1,
  children: [text(content)],
})

const body = (...children: object[]) => ({
  root: { type: 'root', version: 1, children },
})

const figure = (image: unknown) => ({
  type: 'block',
  version: 2,
  fields: {
    id: 'figure',
    blockType: 'figure',
    image,
    alt: 'A circular progress bar',
  },
})

const code = {
  type: 'block',
  version: 2,
  fields: {
    id: 'code',
    blockType: 'code',
    language: 'css',
    code: '.progress { border-radius: 50%; }',
  },
}

const tags = {
  1: { id: 1, name: 'css', slug: 'css' },
  2: { id: 2, name: 'a11y', slug: 'a11y' },
}

const media = {
  id: 3,
  alt: '',
  filename: 'progress-bar.png',
  mimeType: 'image/png',
  width: 1600,
  height: 900,
  url: '/api/media/file/progress-bar.png',
}

/** An unsaved Draft, with its relationships as IDs */
const draft = (title: string, tagIds = [1]) => ({
  id: 7,
  title,
  slug: 'a-circular-progress-bar',
  description: 'Conic gradients and no JavaScript.',
  _status: 'draft',
  body: body(paragraph('A progress bar.'), figure(3), code),
  tags: tagIds,
})

/** Payload populating an unsaved Post, as it does for Live Preview */
function populated(post: ReturnType<typeof draft>) {
  return {
    ...post,
    body: JSON.parse(
      JSON.stringify(post.body).replaceAll(
        '"image":3',
        `"image":${JSON.stringify(media)}`,
      ),
    ),
    tags: post.tags.map((id) => tags[id as keyof typeof tags]),
  }
}

/** Frames /preview/ in a page on `origin`, and counts population requests */
async function openPreview(page: Page, origin = cmsOrigin) {
  const populations: Request[] = []

  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.origin === 'http://localhost:4173') return route.continue()
    if (url.origin === origin && url.pathname === '/admin/') {
      return route.fulfill({
        contentType: 'text/html',
        body: `<script>
          window.previewReady = new Promise((resolve) =>
            addEventListener('message', ({ data }) => data.ready && resolve()))
        </script>
        <iframe src="${previewUrl}" width="800" height="600"></iframe>`,
      })
    }
    if (url.origin === cmsOrigin && url.pathname === '/api/posts/7') {
      const headers = {
        'Access-Control-Allow-Origin': 'http://localhost:4173',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers':
          'Content-Type, X-Payload-HTTP-Method-Override',
      }
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 204, headers })
      }
      populations.push(route.request())
      const { data } = route.request().postDataJSON()
      return route.fulfill({ headers, json: populated(data) })
    }
    return route.abort()
  })

  await page.goto(`${origin}/admin/`)
  const preview = page.frameLocator('iframe')
  await expect(preview.getByText('Waiting for the CMS…')).toBeVisible()
  // Live Preview waits for the page to say it's ready, which only the CMS hears
  if (origin === cmsOrigin) {
    await page.evaluate(
      () => (window as unknown as { previewReady: Promise<void> }).previewReady,
    )
  }
  const send = (post: object) =>
    page.evaluate(
      (post) =>
        document.querySelector('iframe')!.contentWindow!.postMessage(
          {
            type: 'payload-live-preview',
            collectionSlug: 'posts',
            data: post,
          },
          '*',
        ),
      post,
    )
  return { preview, send, populations }
}

test('renders the Post the CMS sends, with the site’s layout', async ({
  page,
}) => {
  const { preview, send, populations } = await openPreview(page)

  await send(draft('A circular progress bar'))

  const article = preview.locator('article')
  await expect(article.locator('[itemprop="headline"]')).toHaveText(
    'A circular progress bar',
  )
  await expect(preview.locator('#header h1')).toBeVisible()
  await expect(preview.locator('#footer')).toBeVisible()
  await expect(article.locator('figure.image img')).toHaveAttribute(
    'alt',
    'A circular progress bar',
  )
  await expect(article.locator('.language-css pre code')).toContainText(
    'border-radius: 50%;',
  )
  await expect(article.getByRole('link', { name: 'css' })).toHaveAttribute(
    'href',
    '/tags/css/',
  )
  expect(populations).toHaveLength(1)
  expect(populations[0].headers()['x-payload-http-method-override']).toBe('GET')
})

test('updates with every change, and only asks the CMS about new docs', async ({
  page,
}) => {
  const { preview, send, populations } = await openPreview(page)
  const title = preview.locator('article [itemprop="headline"]')

  await send(draft('A circular'))
  await expect(title).toHaveText('A circular')

  await send(draft('A circular progress'))
  await send(draft('A circular progress bar'))
  await expect(title).toHaveText('A circular progress bar')
  expect(populations).toHaveLength(1)

  await send(draft('A circular progress bar', [1, 2]))
  await expect(preview.getByRole('link', { name: 'a11y' })).toBeVisible()
  expect(populations).toHaveLength(2)
})

test('ignores messages from any origin but the CMS', async ({ page }) => {
  const { preview, send, populations } = await openPreview(
    page,
    'https://evil.example',
  )

  await send(draft('Injected'))
  await page.waitForTimeout(500)

  await expect(preview.getByText('Waiting for the CMS…')).toBeVisible()
  await expect(preview.locator('article')).toHaveCount(0)
  expect(populations).toHaveLength(0)
})

test('explains a Post it can’t render', async ({ page }) => {
  const { preview, send } = await openPreview(page)

  await send({ ...draft('A table'), body: body({ type: 'table' }) })

  await expect(preview.getByRole('alert')).toHaveText(
    `Can't preview this Post: Can't render Lexical node of type "table"`,
  )
})

test('is not for search engines', async ({ page }) => {
  await page.goto('/preview/')

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex',
  )
})
