import { error } from '@sveltejs/kit'
import { pageCount } from '#lib/posts'
import { contentSource } from '#lib/server/content'
import { loadPostIndex } from '#lib/server/post-index'
import type { EntryGenerator, PageServerLoad } from './$types'

export const entries: EntryGenerator = async () => {
  const posts = await contentSource().getPosts()
  const totalPages = pageCount(posts)
  // The first page is `/`, so there is no `/page1/`
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: String(i + 2),
  }))
}

export const load: PageServerLoad = ({ params }) => {
  const page = Number(params.page)
  if (page < 2 || params.page !== String(page)) error(404, 'Not found')
  return loadPostIndex(page)
}
