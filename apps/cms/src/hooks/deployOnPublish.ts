import type { Post } from 'cms-types'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from 'payload'

/** Asks GitHub Actions to rebuild and deploy the site (ADR 0001) */
export type Dispatcher = {
  dispatch: (req: PayloadRequest) => Promise<void>
}

declare module 'payload' {
  export interface RequestContext {
    /** Replaces the GitHub dispatcher, so tests can stub it */
    dispatcher?: Dispatcher
  }
}

const repository = 'frippz/justfredrik.com'
export const eventType = 'content-changed'

/** Sends a `repository_dispatch` with the Worker secret `GITHUB_DISPATCH_TOKEN` */
export const githubDispatcher: Dispatcher = {
  dispatch: async (req) => {
    const token = process.env.GITHUB_DISPATCH_TOKEN
    if (!token) {
      req.payload.logger.warn(
        'GITHUB_DISPATCH_TOKEN is not set, so the site is not deployed',
      )
      return
    }
    const response = await fetch(
      `https://api.github.com/repos/${repository}/dispatches`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'justfredrik-cms',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ event_type: eventType }),
      },
    )
    if (!response.ok) {
      throw new Error(
        `repository_dispatch failed: ${response.status} ${await response.text()}`,
      )
    }
  },
}

// The Post is saved either way, so a failed dispatch is logged, not thrown
const deploy = async (req: PayloadRequest) => {
  const dispatcher = req.context.dispatcher ?? githubDispatcher
  try {
    await dispatcher.dispatch(req)
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'Could not deploy the site' })
  }
}

/**
 * Deploys when the live Post changes: on publish, on an edit published again,
 * and on unpublish. Saving a Draft only adds a version, so it deploys nothing.
 */
export const deployAfterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  previousDoc,
  req,
}) => {
  if (doc._status === 'published') {
    await deploy(req)
    return
  }
  // A Draft saved over a published Post leaves the live document published
  const live = await req.payload.db.findOne<Post>({
    collection: collection.slug,
    where: { id: { equals: doc.id } },
    req,
  })
  if (live?._status !== 'published' && previousDoc?._status === 'published') {
    await deploy(req)
  }
}

export const deployAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  if (doc._status === 'published') {
    await deploy(req)
  }
}
