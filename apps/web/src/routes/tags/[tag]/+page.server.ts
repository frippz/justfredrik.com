import { error } from '@sveltejs/kit'
import { postPath } from '#lib/posts'
import { contentSource } from '#lib/server/content'
import { tagCloud } from '#lib/tags'
import type { EntryGenerator, PageServerLoad } from './$types'

// Built from published Posts only, so a Tag used only by Drafts has no page
const loadTags = async () => tagCloud(await contentSource().getPosts())

export const entries: EntryGenerator = async () =>
  (await loadTags()).map(({ tag }) => ({ tag: tag.slug }))

export const load: PageServerLoad = async ({ params }) => {
  const tagged = (await loadTags()).find(({ tag }) => tag.slug === params.tag)
  if (!tagged) error(404, 'Not found')

  return {
    title: `Articles tagged with “${tagged.tag.name}”`,
    tag: tagged.tag.name,
    posts: tagged.posts.map((post) => ({
      title: post.title,
      path: postPath(post),
      publishedAt: post.publishedAt,
    })),
  }
}
