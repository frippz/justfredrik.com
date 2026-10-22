import { contentSource } from '#lib/server/content'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({
  title: 'The personal journal of Fredrik Frodlund',
  description:
    'Articles and musings on web development, web standards, accessibility, usability and anything else related to the web or web technologies.',
  posts: await contentSource().getPosts(),
})
