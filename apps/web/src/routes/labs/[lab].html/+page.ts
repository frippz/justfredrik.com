import { error } from '@sveltejs/kit'
import { labs } from '#lib/labs'
import type { EntryGenerator, PageLoad } from './$types'

// Lab URLs end in `.html`, so they get no trailing slash
export const trailingSlash = 'never'

export const entries: EntryGenerator = () =>
  labs.map(({ name }) => ({ lab: name }))

export const load: PageLoad = ({ params }) => {
  const lab = labs.find(({ name }) => name === params.lab)
  if (!lab) error(404, 'Not found')
  return { title: lab.title, lab }
}
