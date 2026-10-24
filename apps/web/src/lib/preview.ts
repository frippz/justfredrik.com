import type { Post } from 'cms-types'

// Payload's Live Preview sends the Post being edited with its relationships as
// IDs: its Tags, the images in Figure blocks and the Posts internal links point
// to. Populating them takes a request to the CMS, so the preview remembers the
// docs it has seen and only asks again when one of them is new.

type Ref = string | number | { id: string | number }

type MapRef = (collection: string, ref: Ref) => Ref

// A populated doc is left as it is, so its own relationships aren't visited
function mapFields(
  type: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any block's or link's fields
  fields: Record<string, any>,
  mapRef: MapRef,
) {
  const isFigure = type === 'block' && fields.blockType === 'figure'
  const isLink = type === 'link' || type === 'autolink'

  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => {
      if (isFigure && key === 'image' && value) {
        return [key, mapRef('media', value)]
      }
      if (isLink && key === 'doc' && value?.value) {
        return [key, { ...value, value: mapRef(value.relationTo, value.value) }]
      }
      return [key, mapNode(value, mapRef)]
    }),
  )
}

function mapNode(node: unknown, mapRef: MapRef): unknown {
  if (Array.isArray(node)) return node.map((child) => mapNode(child, mapRef))
  if (!node || typeof node !== 'object') return node

  const { type } = node as { type?: unknown }
  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [
      key,
      key === 'fields' && value && typeof value === 'object'
        ? mapFields(type, value as Record<string, unknown>, mapRef)
        : mapNode(value, mapRef),
    ]),
  )
}

/** A copy of the Post with `mapRef` applied to each of its relationships */
const mapRelationships = (post: Post, mapRef: MapRef): Post => ({
  ...post,
  tags: post.tags?.map((tag) => mapRef('tags', tag) as never),
  body: mapNode(post.body, mapRef) as Post['body'],
})

/** The populated docs a preview has seen, by collection and ID */
export class Relationships {
  #docs = new Map<string, Map<string | number, Ref>>()

  /** Remembers the docs in a Post the CMS populated */
  remember(post: Post) {
    mapRelationships(post, (collection, ref) => {
      if (typeof ref === 'object') {
        if (!this.#docs.has(collection)) this.#docs.set(collection, new Map())
        this.#docs.get(collection)!.set(ref.id, ref)
      }
      return ref
    })
  }

  /** Forgets every doc, such as when one was edited elsewhere */
  forget() {
    this.#docs.clear()
  }

  /** The Post with its relationships populated, unless one hasn't been seen */
  populate(post: Post): Post | undefined {
    let complete = true
    const populated = mapRelationships(post, (collection, ref) => {
      if (typeof ref === 'object') return ref
      const doc = this.#docs.get(collection)?.get(ref)
      if (!doc) complete = false
      return doc ?? ref
    })
    return complete ? populated : undefined
  }
}
