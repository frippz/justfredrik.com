import type { Post, Tag } from '#lib/server/content'

/** `/tags/<tag>/`, frozen by ADR 0003 */
export const tagPath = (tag: Pick<Tag, 'slug'>) => `/tags/${tag.slug}/`

export interface TaggedPosts<P> {
  tag: Tag
  /** Newest first, as the Posts were given */
  posts: P[]
  /** 1–5, frippz.se's tag cloud size class */
  set: number
}

/**
 * Every Tag used by the given Posts, with its Posts. Sorted by name in code
 * unit order, as jekyll-tagging did, so "macOS" comes before "macbook pro".
 */
export function tagCloud<P extends Pick<Post, 'tags'>>(
  posts: P[],
): TaggedPosts<P>[] {
  const bySlug = new Map<string, { tag: Tag; posts: P[] }>()
  for (const post of posts) {
    for (const tag of post.tags) {
      const entry = bySlug.get(tag.slug) ?? { tag, posts: [] }
      entry.posts.push(post)
      bySlug.set(tag.slug, entry)
    }
  }

  const entries = [...bySlug.values()]
  const counts = entries.map((entry) => entry.posts.length)
  const min = Math.min(...counts)
  const max = Math.max(...counts)

  return entries
    .map((entry) => ({ ...entry, set: weight(entry.posts.length, min, max) }))
    .sort((a, b) => compare(a.tag.name, b.tag.name))
}

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

/** jekyll-tagging's five size classes, scaled linearly from the least to the most used Tag */
const weight = (count: number, min: number, max: number) =>
  max === min ? 1 : Math.max(1, Math.ceil(((count - min) / (max - min)) * 5))
