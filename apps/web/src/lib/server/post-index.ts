import { error } from '@sveltejs/kit'
import { paginate } from '#lib/posts'
import { contentSource } from '#lib/server/content'

/** Page data for `/` and `/pageN/`, which show the same index one page at a time */
export async function loadPostIndex(page: number) {
  const pagination = paginate(await contentSource().getPosts(), page)
  if (!pagination) error(404, 'Not found')

  return {
    title: 'The personal journal of Fredrik Frodlund',
    description:
      'Articles and musings on web development, web standards, accessibility, usability and anything else related to the web or web technologies.',
    pageNumber: page,
    pagination,
  }
}
