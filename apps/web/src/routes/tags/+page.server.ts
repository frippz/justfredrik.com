import { contentSource } from '#lib/server/content'
import { tagCloud, tagPath } from '#lib/tags'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({
  title: 'Tags & keywords',
  tags: tagCloud(await contentSource().getPosts()).map(({ tag, set }) => ({
    name: tag.name,
    path: tagPath(tag),
    set,
  })),
})
