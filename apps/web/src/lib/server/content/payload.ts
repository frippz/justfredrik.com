import { PAYLOAD_URL } from '$app/env/private'
import type { Post as PayloadPost, Tag as PayloadTag } from 'cms-types'
import { postPath } from '#lib/posts'
import type { ContentSource, Post, Tag } from './types'

// Reads Payload's REST API anonymously, so the build sees exactly what a
// visitor would: published Posts only, per the CMS's access control

/** Fetches a REST path, such as `/api/posts`, and parses the JSON */
async function get<T>(path: string, query: Record<string, string>) {
  const url = new URL(path, PAYLOAD_URL)
  url.search = new URLSearchParams(query).toString()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`)
  }
  return (await response.json()) as T
}

function toTag(tag: number | PayloadTag): Tag {
  if (typeof tag !== 'object') throw new Error(`Tag ${tag} is not populated`)
  return { name: tag.name, slug: tag.slug! }
}

function toPost(post: PayloadPost): Post {
  if (!post.publishedAt || !post.slug) {
    throw new Error(`Published Post ${post.id} has no publish date or slug`)
  }
  return {
    title: post.title,
    slug: post.slug,
    description: post.description,
    publishedAt: post.publishedAt,
    revisedAt: post.revisedAt ?? undefined,
    body: post.body,
    tags: (post.tags ?? []).map(toTag),
  }
}

async function fetchPosts() {
  const { docs } = await get<{ docs: PayloadPost[] }>('/api/posts', {
    'where[_status][equals]': 'published',
    sort: '-publishedAt',
    pagination: 'false',
    // Populates Tags, and the Media in Figure blocks
    depth: '2',
  })
  return docs.map(toPost)
}

// Every prerendered page asks for the Posts, so the build fetches them once
let posts: Promise<Post[]> | undefined

export const payloadSource: ContentSource = {
  getPosts() {
    posts ??= fetchPosts()
    return posts
  },

  async getPost({ year, month, day, slug }) {
    const path = `/${year}/${month}/${day}/${slug}/`
    return (await this.getPosts()).find((post) => postPath(post) === path)
  },
}
