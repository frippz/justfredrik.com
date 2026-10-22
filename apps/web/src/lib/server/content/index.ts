import { CONTENT_SOURCE } from '$app/env/private'
import { fixtureSource } from './fixture'
import type { ContentSource } from './types'

export type { ContentSource, Post, PostPath, Tag } from './types'

const sources = {
  fixture: fixtureSource,
} satisfies Record<typeof CONTENT_SOURCE, ContentSource>

/** The only way the site reaches content. `CONTENT_SOURCE` picks the implementation. */
export const contentSource = (): ContentSource => sources[CONTENT_SOURCE]
