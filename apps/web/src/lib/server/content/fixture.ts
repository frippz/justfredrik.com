import { postPath } from '#lib/posts'
import { fixturePosts } from './fixture-posts'
import type { ContentSource } from './types'

export const fixtureSource: ContentSource = {
  async getPosts() {
    return fixturePosts
      .filter((post) => post.status === 'published')
      .map(({ status, ...post }) => post)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  },

  async getPost({ year, month, day, slug }) {
    const path = `/${year}/${month}/${day}/${slug}/`
    return (await this.getPosts()).find((post) => postPath(post) === path)
  },
}
