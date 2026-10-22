export interface Post {
  title: string
  slug: string
  description: string
  /** ISO 8601 */
  publishedAt: string
}

export interface ContentSource {
  /** All published Posts, newest first */
  getPosts(): Promise<Post[]>
}
