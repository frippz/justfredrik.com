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
  /** The published Post at `/:year/:month/:day/:slug/`, if there is one */
  getPost(path: PostPath): Promise<Post | undefined>
}

export interface PostPath {
  year: string
  month: string
  day: string
  slug: string
}
