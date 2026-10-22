import type { FigureBlock } from 'cms-types'
import { contentSizes, mediaSrcset, mediaUrl } from '#lib/media'
import { escapeHtml } from './escape'

/** A Figure block in the markup of frippz.se's `image.html` include */
export function renderFigure(block: FigureBlock, caption: string) {
  if (typeof block.image !== 'object') {
    throw new Error(`Figure image ${block.image} is not populated`)
  }
  const image = block.image

  const attributes = [
    `src="${escapeHtml(mediaUrl(image))}"`,
    image.height && `height="${image.height}"`,
    image.width && `width="${image.width}"`,
    `srcset="${escapeHtml(mediaSrcset(image))}"`,
    `sizes="${contentSizes}"`,
    `alt="${escapeHtml(block.alt)}"`,
    'loading="lazy"',
  ].filter(Boolean)

  let img = `<img ${attributes.join(' ')}>`
  if (block.link) img = `<a href="${escapeHtml(block.link)}">${img}</a>`

  const figcaption = caption ? `<figcaption>${caption}</figcaption>` : ''
  return `<figure class="image">${img}${figcaption}</figure>`
}
