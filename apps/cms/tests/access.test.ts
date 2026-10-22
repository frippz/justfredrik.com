import type { Media, Post, Tag } from 'cms-types'
import type { PaginatedDocs, Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { anonymousGet, paragraph, payloadInstance } from './payload'

// A 1×1 transparent PNG
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

let payload: Payload
let tag: Tag
let media: Media
let published: Post
let draft: Post
let publishedWithDraft: Post

const titles = (docs: Post[]) => docs.map(({ title }) => title).sort()

beforeAll(async () => {
  payload = await payloadInstance()

  tag = await payload.create({
    collection: 'tags',
    data: { name: 'Access tag' },
  })
  media = await payload.create({
    collection: 'media',
    data: { alt: 'A single pixel' },
    file: {
      data: png,
      mimetype: 'image/png',
      name: 'pixel.png',
      size: png.length,
    },
  })

  const post = (title: string, _status: 'draft' | 'published') =>
    payload.create({
      collection: 'posts',
      data: {
        title,
        description: `${title} description`,
        body: paragraph(title),
        tags: [tag.id],
        _status,
      },
    })

  published = await post('Published Post', 'published')
  draft = await post('Draft Post', 'draft')
  publishedWithDraft = await post('Published with Draft', 'published')
  await payload.update({
    collection: 'posts',
    id: publishedWithDraft.id,
    data: { title: 'Unpublished edit', _status: 'draft' },
    draft: true,
  })
})

afterAll(async () => {
  await payload.destroy()
})

describe('anonymous REST reads of Posts', () => {
  it('lists published Posts and no Drafts', async () => {
    const { status, body } = await anonymousGet<PaginatedDocs<Post>>('/posts')

    expect(status).toBe(200)
    expect(titles(body.docs)).toEqual([
      'Published Post',
      'Published with Draft',
    ])
  })

  it('returns no Drafts when asking for drafts', async () => {
    const { body } =
      await anonymousGet<PaginatedDocs<Post>>('/posts?draft=true')

    // A Post whose latest version is a Draft is left out rather than leaked
    expect(titles(body.docs)).toEqual(['Published Post'])
  })

  it('returns no Drafts when filtering on draft status', async () => {
    const { body } = await anonymousGet<PaginatedDocs<Post>>(
      '/posts?where[_status][equals]=draft',
    )

    expect(body.docs).toEqual([])
  })

  it('returns a published Post by ID, with its Tags', async () => {
    const { status, body } = await anonymousGet<Post>(`/posts/${published.id}`)

    expect(status).toBe(200)
    expect(body.title).toBe('Published Post')
    expect(body.tags).toMatchObject([{ id: tag.id, name: 'Access tag' }])
  })

  it('refuses a Draft by ID', async () => {
    const { status } = await anonymousGet(`/posts/${draft.id}`)
    const { status: asDraft } = await anonymousGet(
      `/posts/${draft.id}?draft=true`,
    )

    expect(status).toBe(404)
    expect(asDraft).toBe(404)
  })

  it('refuses versions', async () => {
    const { status } = await anonymousGet('/posts/versions')

    expect(status).toBe(403)
  })
})

describe('anonymous REST reads of Tags and Media', () => {
  it('lists Tags', async () => {
    const { status, body } = await anonymousGet<PaginatedDocs<Tag>>('/tags')

    expect(status).toBe(200)
    expect(body.docs).toMatchObject([
      { name: 'Access tag', slug: 'access-tag' },
    ])
  })

  it('lists Media', async () => {
    const { status, body } = await anonymousGet<PaginatedDocs<Media>>('/media')

    expect(status).toBe(200)
    expect(body.docs).toMatchObject([{ id: media.id, alt: 'A single pixel' }])
  })

  it('serves Media files', async () => {
    const { status } = await anonymousGet(`/media/file/${media.filename}`)

    expect(status).toBe(200)
  })
})

describe('anonymous REST reads of Users', () => {
  it('refuses them', async () => {
    const { status } = await anonymousGet('/users')

    expect(status).toBe(403)
  })
})
