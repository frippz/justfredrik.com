import type { Post, Tag } from 'cms-types'
import { handleEndpoints, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import config from '../src/payload.config'
import { anonymousGet, paragraph, payloadInstance } from './payload'

const siteOrigin = 'http://localhost:5173'

let payload: Payload
let tag: Tag
let draft: Post
let token: string

beforeAll(async () => {
  payload = await payloadInstance()

  const user = { email: 'preview@example.com', password: 'preview' }
  await payload.create({ collection: 'users', data: user })
  token = (await payload.login({ collection: 'users', data: user })).token!

  tag = await payload.create({
    collection: 'tags',
    data: { name: 'Preview tag' },
  })
  draft = await payload.create({
    collection: 'posts',
    data: {
      title: 'Never published',
      description: 'A Draft to preview',
      body: paragraph('Never published'),
      tags: [tag.id],
      _status: 'draft',
    },
  })
})

afterAll(async () => {
  await payload.delete({ collection: 'posts', id: draft.id })
  await payload.delete({ collection: 'tags', id: tag.id })
  await payload.delete({
    collection: 'users',
    where: { email: { equals: 'preview@example.com' } },
  })
  await payload.destroy()
})

/** An unsaved body with an internal link to the Draft */
const linkToDraft = () => {
  const body = paragraph('See ')
  body.root.children[0].children.push({
    type: 'link',
    version: 3,
    fields: {
      linkType: 'internal',
      doc: { relationTo: 'posts', value: draft.id },
    },
    children: [{ type: 'text', text: 'the Draft', version: 1 }],
  } as never)
  return body
}

/**
 * The request Payload's live-preview client sends to populate a Post. Payload
 * echoes the unsaved data back, with each relationship populated if the
 * requester may read it.
 */
async function populate(headers: Record<string, string>) {
  const response = await handleEndpoints({
    config,
    request: new Request(`http://localhost/api/posts/${draft.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Payload-HTTP-Method-Override': 'GET',
        ...headers,
      },
      body: JSON.stringify({
        data: { title: 'Unsaved title', body: linkToDraft(), tags: [tag.id] },
        depth: 2,
      }),
    }),
  })
  const post = (await response.json()) as Post
  const link = post.body.root.children[0].children as {
    fields?: { doc: { value: unknown } }
  }[]
  return { response, post, linked: link[1].fields?.doc.value }
}

describe('Live Preview', () => {
  it('frames the site’s preview page for Posts', async () => {
    const { livePreview } = (await config).admin!

    expect(livePreview?.collections).toEqual(['posts'])
    const url = livePreview?.url as unknown as (args: {
      data: { id: number }
    }) => string
    expect(url({ data: { id: 42 } })).toBe(`${siteOrigin}/preview/?id=42`)
  })

  it('populates an unsaved Post, Drafts included, for the editor on the site', async () => {
    const { response, post, linked } = await populate({
      Cookie: `payload-token=${token}`,
      Origin: siteOrigin,
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(siteOrigin)
    expect(post.title).toBe('Unsaved title')
    expect(post.tags).toMatchObject([{ id: tag.id, name: 'Preview tag' }])
    expect(linked).toMatchObject({ id: draft.id, title: 'Never published' })
  })

  it('ignores the editor’s cookie from any other origin', async () => {
    const { response, linked } = await populate({
      Cookie: `payload-token=${token}`,
      Origin: 'https://evil.example',
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
    expect(linked).not.toMatchObject({ title: 'Never published' })
  })

  it('keeps the Draft from anonymous requests', async () => {
    const { linked } = await populate({ Origin: siteOrigin })
    const { status } = await anonymousGet(`/posts/${draft.id}`)

    expect(linked).not.toMatchObject({ title: 'Never published' })
    expect(status).toBe(404)
  })
})
