import { error } from '@sveltejs/kit'
import { postPath } from '#lib/posts'
import { contentSource } from '#lib/server/content'
import type { EntryGenerator, PageServerLoad } from './$types'

export const entries: EntryGenerator = async () =>
  (await contentSource().getPosts()).map((post) => {
    const [year, month, day, slug] = postPath(post).split('/').filter(Boolean)
    return { year, month, day, slug }
  })

export const load: PageServerLoad = async ({ params }) => {
  const post = await contentSource().getPost(params)
  if (!post) error(404, 'Not found')

  return { title: post.title, description: post.description, post }
}
