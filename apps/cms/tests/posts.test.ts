import type { Post } from 'cms-types'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { paragraph, payloadInstance } from './payload'

let payload: Payload

beforeAll(async () => {
  payload = await payloadInstance()
})

afterAll(async () => {
  await payload.destroy()
})

const createPost = (
  data: Partial<Post> & { title: string },
  _status: 'draft' | 'published' = 'draft',
) =>
  payload.create({
    collection: 'posts',
    data: {
      description: 'A description',
      body: paragraph(data.title),
      ...data,
      _status,
    },
    draft: _status === 'draft',
  })

const updatePost = (
  id: number,
  data: Partial<Post>,
  _status: 'draft' | 'published' = 'draft',
) =>
  payload.update({
    collection: 'posts',
    id,
    data: { ...data, _status },
    draft: _status === 'draft',
  })

describe('Post slug', () => {
  it('is generated from the title on first save', async () => {
    const post = await createPost({
      title: 'Hello, Wörld: Smörgåsbord & more!',
    })

    expect(post.slug).toBe('hello-world-smorgasbord-more')
  })

  it('keeps a slug given on first save', async () => {
    const post = await createPost({ title: 'Some title', slug: 'my-own-slug' })

    expect(post.slug).toBe('my-own-slug')
  })

  it('stays the same when the title changes', async () => {
    const post = await createPost({ title: 'Original title' })
    const updated = await updatePost(post.id, { title: 'A new title' })

    expect(updated.slug).toBe('original-title')
  })

  it('can be edited', async () => {
    const post = await createPost({ title: 'Awkward slug title' })
    const updated = await updatePost(post.id, { slug: 'better-slug' })

    expect(updated.slug).toBe('better-slug')
  })

  it('is unique', async () => {
    await createPost({ title: 'Twice' })

    await expect(createPost({ title: 'Twice' })).rejects.toThrow()
  })
})

describe('Tag slug', () => {
  it('is generated from the name on first save', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Web Components' },
    })

    expect(tag.slug).toBe('web-components')
  })
})

describe('Post publish date', () => {
  it('is not set when saving a Draft', async () => {
    const post = await createPost({ title: 'Never published' })

    expect(post.publishedAt).toBeFalsy()
  })

  it('is set on first publish', async () => {
    const before = Date.now()
    const post = await createPost({ title: 'Publish later' })
    const updated = await updatePost(post.id, {}, 'published')

    expect(Date.parse(updated.publishedAt!)).toBeGreaterThanOrEqual(before)
    expect(Date.parse(updated.publishedAt!)).toBeLessThanOrEqual(Date.now())
  })

  it('is set when a Post is published straight away', async () => {
    const post = await createPost({ title: 'Publish now' }, 'published')

    expect(post.publishedAt).toBeTruthy()
  })

  it('stays the same when a published Post is edited and published again', async () => {
    const post = await createPost({ title: 'Edit after publish' }, 'published')
    const updated = await updatePost(
      post.id,
      { title: 'Edited after publish' },
      'published',
    )

    expect(updated.publishedAt).toBe(post.publishedAt)
  })

  it('can be edited', async () => {
    const post = await createPost({ title: 'Backdated' }, 'published')
    const updated = await updatePost(
      post.id,
      { publishedAt: '2014-03-01T12:00:00.000Z' },
      'published',
    )

    expect(updated.publishedAt).toBe('2014-03-01T12:00:00.000Z')
  })

  it('keeps a date given before first publish', async () => {
    const post = await createPost({
      title: 'Backdated before publish',
      publishedAt: '2015-06-10T08:00:00.000Z',
    })
    const updated = await updatePost(post.id, {}, 'published')

    expect(updated.publishedAt).toBe('2015-06-10T08:00:00.000Z')
  })
})
