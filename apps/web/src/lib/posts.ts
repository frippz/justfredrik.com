import type { Post } from '#lib/server/content'

/** As on frippz.se, where jekyll-paginate showed five Posts per page */
export const postsPerPage = 5

/** `/:year/:month/:day/:slug/`, frozen by ADR 0003 */
export function postPath(post: Pick<Post, 'publishedAt' | 'slug'>) {
  const [year, month, day] = post.publishedAt.slice(0, 10).split('-')
  return `/${year}/${month}/${day}/${post.slug}/`
}

/** `/` for the first page, then `/page2/`, `/page3/`, … */
export const pagePath = (page: number) => (page === 1 ? '/' : `/page${page}/`)

/** Jekyll's default `slugify`, used for frippz.se's article ids */
export const slugify = (text: string) =>
  text
    .replace(/[^\p{L}\p{M}\p{Nd}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

export const pageCount = (posts: Post[]) =>
  Math.max(1, Math.ceil(posts.length / postsPerPage))

export interface Pagination {
  posts: Post[]
  page: number
  totalPages: number
  olderPath?: string
  newerPath?: string
}

/** One page of Posts, or undefined when the page doesn't exist */
export function paginate(posts: Post[], page: number): Pagination | undefined {
  const totalPages = pageCount(posts)
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return

  return {
    posts: posts.slice((page - 1) * postsPerPage, page * postsPerPage),
    page,
    totalPages,
    olderPath: page < totalPages ? pagePath(page + 1) : undefined,
    newerPath: page > 1 ? pagePath(page - 1) : undefined,
  }
}
