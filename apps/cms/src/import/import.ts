import fs from 'node:fs/promises'
import path from 'node:path'
import type { Media, Post } from 'cms-types'
import type { Payload } from 'payload'
import { mediaUrl } from '../../../web/src/lib/media'
import { slugify } from '../fields/slug'
import type { ImportedPost, Node } from './convert'
import { frippzDir } from './source'

export interface ImageFile {
  data: Buffer
  name: string
  mimetype: string
}

const mimeTypes: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
}

/** An image from frippz.se's `/images/`, or downloaded when it was hotlinked */
export async function loadImage(src: string): Promise<ImageFile> {
  const name = path.basename(new URL(src, 'https://frippz.se').pathname)
  const mimetype = mimeTypes[path.extname(name).toLowerCase()]
  if (!mimetype) throw new Error(`Unknown image type: ${src}`)

  if (src.startsWith('/images/')) {
    return {
      data: await fs.readFile(path.join(frippzDir, src)),
      name,
      mimetype,
    }
  }
  const response = await fetch(src)
  if (!response.ok) throw new Error(`GET ${src} failed with ${response.status}`)
  return { data: Buffer.from(await response.arrayBuffer()), name, mimetype }
}

/** Finds a document by a unique field, or creates it */
async function findOrCreate<T>(
  find: () => Promise<{ docs: T[] }>,
  create: () => Promise<T>,
) {
  const { docs } = await find()
  return docs[0] ?? create()
}

/** A copy of a body with image sources swapped for the uploaded Media */
function withUploads(node: Node, media: Map<string, Media>): Node {
  const copy = { ...node }
  if (copy.children) {
    copy.children = copy.children.map((child) => withUploads(child, media))
  }
  if (copy.type !== 'block') return copy

  const fields = { ...(copy.fields as Record<string, unknown>) }
  if (fields.blockType === 'figure') {
    fields.image = media.get(fields.image as string)!.id
    const link = media.get(fields.link as string)
    if (link) fields.link = mediaUrl(link)
  }
  if (fields.blockType === 'html') {
    fields.html = (fields.html as string).replace(
      /(?<=(?:src|href)=")\/images\/[^"]+/g,
      (src) => mediaUrl(media.get(src)!),
    )
  }
  copy.fields = fields
  return copy
}

/**
 * Writes the Posts, their Tags and their images to Payload, published. Tags,
 * Media and Posts already there are found by slug or filename and reused, so
 * running it again updates the Posts instead of duplicating anything.
 */
export async function importPosts(
  payload: Payload,
  posts: ImportedPost[],
  load: (src: string) => Promise<ImageFile> = loadImage,
) {
  const tags = new Map<string, number>()
  for (const name of new Set(posts.flatMap((post) => post.tags))) {
    const slug = slugify(name)
    const tag = await findOrCreate(
      () =>
        payload.find({
          collection: 'tags',
          where: { slug: { equals: slug } },
          limit: 1,
        }),
      () => payload.create({ collection: 'tags', data: { name, slug } }),
    )
    tags.set(name, tag.id)
  }

  const media = new Map<string, Media>()
  for (const post of posts) {
    for (const [src, alt] of post.images) {
      if (media.has(src)) continue
      const file = await load(src)
      media.set(
        src,
        await findOrCreate(
          () =>
            payload.find({
              collection: 'media',
              where: { filename: { equals: file.name } },
              limit: 1,
            }),
          () =>
            payload.create({
              collection: 'media',
              data: { alt },
              file: { ...file, size: file.data.length },
            }),
        ),
      )
    }
  }

  for (const { images, tags: tagNames, body, ...post } of posts) {
    const data = {
      ...post,
      revisedAt: post.revisedAt ?? null,
      body: { root: withUploads(body.root, media) } as Post['body'],
      tags: tagNames.map((name) => tags.get(name)!),
      _status: 'published' as const,
    }
    const { docs } = await payload.find({
      collection: 'posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
      depth: 0,
    })
    if (docs[0]) {
      await payload.update({ collection: 'posts', id: docs[0].id, data })
    } else {
      await payload.create({ collection: 'posts', data })
    }
  }

  return { posts: posts.length, tags: tags.size, media: media.size }
}
