import { PAYLOAD_URL } from '$app/env/public'
import type { FigureBlock, Media } from 'cms-types'
import { contentSizes, mediaSrcset, mediaUrl } from '#lib/media'
import { escapeHtml } from './escape'

// Any CMS but the production one serves its uploads itself, from wrangler's
// emulated R2, and can't scale them
const localCMS = new URL(PAYLOAD_URL).origin !== 'https://cms.justfredrik.com'

function localMediaUrl(media: Media) {
  if (!media.url) throw new Error(`Media ${media.id} has no URL`)
  return new URL(media.url, PAYLOAD_URL).href
}

/** A Figure block in the markup of frippz.se's `image.html` include */
export function renderFigure(block: FigureBlock, caption: string) {
  if (typeof block.image !== 'object') {
    throw new Error(`Figure image ${block.image} is not populated`)
  }
  const image = block.image
  const src = localCMS ? localMediaUrl(image) : mediaUrl(image)
  const srcset = localCMS ? undefined : mediaSrcset(image)

  const attributes = [
    `src="${escapeHtml(src)}"`,
    image.height && `height="${image.height}"`,
    image.width && `width="${image.width}"`,
    srcset && `srcset="${escapeHtml(srcset)}"`,
    srcset && `sizes="${contentSizes}"`,
    `alt="${escapeHtml(block.alt)}"`,
    'loading="lazy"',
  ].filter(Boolean)

  let img = `<img ${attributes.join(' ')}>`
  if (block.link) img = `<a href="${escapeHtml(block.link)}">${img}</a>`

  const figcaption = caption ? `<figcaption>${caption}</figcaption>` : ''
  return `<figure class="image">${img}${figcaption}</figure>`
}
