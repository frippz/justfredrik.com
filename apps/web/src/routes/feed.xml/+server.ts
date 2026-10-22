import { atomFeed } from '#lib/server/feeds'

export const prerender = true

export async function GET() {
  return new Response(await atomFeed(), {
    headers: { 'Content-Type': 'application/atom+xml' },
  })
}
