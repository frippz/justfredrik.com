import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { Dispatcher } from '../src/hooks/deployOnPublish'
import { paragraph, payloadInstance } from './payload'

let payload: Payload
let startedAt: string

beforeAll(async () => {
  payload = await payloadInstance()
  startedAt = new Date().toISOString()
})

// The other test files share the database and expect it without these
afterAll(async () => {
  await payload.delete({
    collection: 'posts',
    where: { createdAt: { greater_than_equal: startedAt } },
    context: setup,
  })
  await payload.destroy()
})

const stubDispatcher = () => ({
  dispatch: vi.fn<Dispatcher['dispatch']>(async () => {}),
})

// Setup steps get their own dispatcher, so only the step under test is counted
const setup = { dispatcher: stubDispatcher() }

const createPost = (
  title: string,
  _status: 'draft' | 'published',
  context = setup,
) =>
  payload.create({
    collection: 'posts',
    data: {
      title,
      description: 'A description',
      body: paragraph(title),
      _status,
    },
    draft: _status === 'draft',
    context,
  })

const updatePost = (
  id: number,
  data: { title?: string; _status: 'draft' | 'published' },
  context = setup,
  draft = data._status === 'draft',
) => payload.update({ collection: 'posts', id, data, draft, context })

describe('Deploy on publish', () => {
  it('dispatches once when a Post is published straight away', async () => {
    const context = { dispatcher: stubDispatcher() }

    await createPost('Published straight away', 'published', context)

    expect(context.dispatcher.dispatch).toHaveBeenCalledOnce()
  })

  it('dispatches once when a Draft is published', async () => {
    const context = { dispatcher: stubDispatcher() }
    const post = await createPost('Draft to publish', 'draft')

    await updatePost(post.id, { _status: 'published' }, context)

    expect(context.dispatcher.dispatch).toHaveBeenCalledOnce()
  })

  it('dispatches once when a Post is unpublished', async () => {
    const context = { dispatcher: stubDispatcher() }
    const post = await createPost('To unpublish', 'published')

    // The admin's Unpublish button saves the Post as a Draft, not as a draft version
    await updatePost(post.id, { _status: 'draft' }, context, false)

    expect(context.dispatcher.dispatch).toHaveBeenCalledOnce()
  })

  it('dispatches once when a published Post is edited and published again', async () => {
    const context = { dispatcher: stubDispatcher() }
    const post = await createPost('To edit', 'published')

    await updatePost(
      post.id,
      { title: 'Edited', _status: 'published' },
      context,
    )

    expect(context.dispatcher.dispatch).toHaveBeenCalledOnce()
  })

  it('dispatches once when a published Post is deleted', async () => {
    const context = { dispatcher: stubDispatcher() }
    const post = await createPost('To delete', 'published')

    await payload.delete({ collection: 'posts', id: post.id, context })

    expect(context.dispatcher.dispatch).toHaveBeenCalledOnce()
  })

  it('does not dispatch when a never-published Draft is saved', async () => {
    const context = { dispatcher: stubDispatcher() }

    const post = await createPost('Never published', 'draft', context)
    await updatePost(
      post.id,
      { title: 'Still a Draft', _status: 'draft' },
      context,
    )

    expect(context.dispatcher.dispatch).not.toHaveBeenCalled()
  })

  it('does not dispatch when a Draft is saved over a published Post', async () => {
    const context = { dispatcher: stubDispatcher() }
    const post = await createPost('Published, then drafted', 'published')

    await updatePost(
      post.id,
      { title: 'Unpublished edit', _status: 'draft' },
      context,
    )
    await updatePost(
      post.id,
      { title: 'Another edit', _status: 'draft' },
      context,
    )

    expect(context.dispatcher.dispatch).not.toHaveBeenCalled()
  })

  it('does not dispatch when a never-published Draft is deleted', async () => {
    const context = { dispatcher: stubDispatcher() }
    const post = await createPost('Draft to delete', 'draft')

    await payload.delete({ collection: 'posts', id: post.id, context })

    expect(context.dispatcher.dispatch).not.toHaveBeenCalled()
  })

  it('still saves the Post when the dispatch fails', async () => {
    const context = {
      dispatcher: {
        dispatch: vi.fn<Dispatcher['dispatch']>(async () => {
          throw new Error('GitHub is down')
        }),
      },
    }

    const post = await createPost('Saved anyway', 'published', context)

    expect(context.dispatcher.dispatch).toHaveBeenCalledOnce()
    expect(
      (await payload.findByID({ collection: 'posts', id: post.id }))._status,
    ).toBe('published')
  })
})
