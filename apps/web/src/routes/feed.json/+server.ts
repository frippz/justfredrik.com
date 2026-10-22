import { json } from '@sveltejs/kit'
import { jsonFeed } from '#lib/server/feeds'

export const prerender = true

export async function GET() {
  return json(await jsonFeed(), {
    headers: { 'Content-Type': 'application/feed+json' },
  })
}
