import fs from 'node:fs'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { convertPosts, type ImportedPost } from '../src/import/convert'
import { importPosts, loadImage } from '../src/import/import'
import { frippzDir, readPosts } from '../src/import/source'
import { payloadInstance } from './payload'

// Importing the real frippz.se Posts into a local Payload. The sibling
// checkout isn't in CI, so it skips these.

const hasSource = fs.existsSync(frippzDir)

/** frippz.se's own images, and a stand-in for hotlinked ones */
const load = async (src: string) =>
  src.startsWith('/images/')
    ? loadImage(src)
    : { ...(await loadImage('/images/pe-nut.jpeg')), name: 'hotlinked.jpeg' }

let payload: Payload
let posts: ImportedPost[]
let startedAt: string

beforeAll(async () => {
  if (!hasSource) return
  payload = await payloadInstance()
  posts = convertPosts(await readPosts())
  startedAt = new Date().toISOString()
})

// The other test files share the database and expect it without these
afterAll(async () => {
  if (!payload) return
  for (const collection of ['posts', 'tags', 'media'] as const) {
    await payload.delete({
      collection,
      where: { createdAt: { greater_than_equal: startedAt } },
    })
  }
  await payload.destroy()
})

const count = async (
  collection: 'posts' | 'tags' | 'media',
  field: string,
  values: string[],
) =>
  (
    await payload.count({
      collection,
      where: { [field]: { in: values } },
    })
  ).totalDocs

describe.skipIf(!hasSource)('Importing the frippz.se Posts', () => {
  it('creates every Post, Tag and image once, however often it runs', async () => {
    const first = await importPosts(payload, posts, load)
    await importPosts(payload, posts, load)

    const slugs = posts.map((post) => post.slug)
    const tagNames = [...new Set(posts.flatMap((post) => post.tags))]

    expect(first).toMatchObject({ posts: 43, tags: 41 })
    expect(await count('posts', 'slug', slugs)).toBe(43)
    expect(await count('tags', 'name', tagNames)).toBe(41)
    const media = await payload.count({
      collection: 'media',
      where: { createdAt: { greater_than_equal: startedAt } },
    })
    expect(media.totalDocs).toBe(first.media)
  }, 300_000)

  it('publishes the Posts with their dates, Tags and Figures', async () => {
    const { docs } = await payload.find({
      collection: 'posts',
      where: { slug: { equals: 'netnewswire-before-and-after' } },
      depth: 2,
    })
    const [post] = docs

    expect(post._status).toBe('published')
    expect(post.publishedAt).toBe('2021-03-30T07:00:00.000Z')
    expect(
      post.tags?.map((tag) => typeof tag === 'object' && tag.name),
    ).toEqual(['macOS', 'apps'])

    const figure = post.body.root.children.find(
      (node) => (node.fields as { blockType?: string })?.blockType === 'figure',
    )?.fields as { image: { filename: string; width: number }; link: string }
    expect(figure.image).toMatchObject({
      filename: 'nnw-before-1330w.png',
      width: 1330,
    })
    expect(figure.link).toBe('https://media.justfredrik.com/nnw-before.png')
  })
})
