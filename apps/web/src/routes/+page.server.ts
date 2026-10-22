import { loadPostIndex } from '#lib/server/post-index'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = () => loadPostIndex(1)
