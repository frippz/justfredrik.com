import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Media } from 'cms-types'
import { getPayload } from 'payload'
import config from '../payload.config'
// The site's fixtures, so a build from this Payload matches the fixture build
import { fixturePosts } from '../../../web/src/lib/server/content/fixture-posts'

// Replaces the local Payload's Posts, Tags and Media with the site's fixtures.
// Run with `pnpm --filter cms seed`.

const dirname = path.dirname(fileURLToPath(import.meta.url))

const payload = await getPayload({ config })

for (const collection of ['posts', 'tags', 'media'] as const) {
  await payload.delete({ collection, where: { id: { exists: true } } })
}

// Each fixture Media is uploaded from the file of the same name next to this
// script, which has the fixture's dimensions
const uploads = new Map<string, Promise<number>>()

const upload = (media: Media, alt: string) => {
  const filename = media.filename!
  if (!uploads.has(filename)) {
    uploads.set(
      filename,
      fs.readFile(path.join(dirname, filename)).then(async (data) => {
        const { id } = await payload.create({
          collection: 'media',
          data: { alt },
          file: {
            data,
            name: filename,
            mimetype: media.mimeType!,
            size: data.length,
          },
        })
        return id
      }),
    )
  }
  return uploads.get(filename)!
}

/** A copy of a Lexical tree with each Figure's populated Media swapped for an uploaded one's ID */
async function withUploads(node: unknown): Promise<unknown> {
  if (Array.isArray(node)) return Promise.all(node.map(withUploads))
  if (!node || typeof node !== 'object') return node

  const entries = await Promise.all(
    Object.entries(node).map(async ([key, value]) => [
      key,
      await withUploads(value),
    ]),
  )
  const copy = Object.fromEntries(entries)
  if (copy.blockType === 'figure') {
    copy.image = await upload(copy.image, copy.alt)
  }
  return copy
}

const tagIds = new Map<string, number>()

for (const tag of fixturePosts.flatMap((post) => post.tags)) {
  if (tagIds.has(tag.slug)) continue
  const { id } = await payload.create({ collection: 'tags', data: tag })
  tagIds.set(tag.slug, id)
}

for (const { status, tags, body, ...post } of fixturePosts) {
  await payload.create({
    collection: 'posts',
    data: {
      ...post,
      body: (await withUploads(body)) as typeof body,
      tags: tags.map((tag) => tagIds.get(tag.slug)!),
      _status: status,
    },
  })
}

payload.logger.info(
  `Seeded ${fixturePosts.length} Posts, ${tagIds.size} Tags and ${uploads.size} Media`,
)
await payload.destroy()
