import type { Media } from 'cms-types'

/** R2 media bucket, per ADR 0002 */
export const mediaOrigin = 'https://media.justfredrik.com'

/** Widths offered in `srcset`, besides the image's own */
export const srcsetWidths = [320, 640, 960, 1280, 1920]

/** The `.landmark-content` column Post bodies sit in */
export const contentSizes = '(min-width: 36em) 34em, 100vw'

const objectPath = (media: Media) => {
  if (!media.filename) throw new Error(`Media ${media.id} has no filename`)
  return media.filename.split('/').map(encodeURIComponent).join('/')
}

/** The original upload, as stored in R2 */
export const mediaUrl = (media: Media) => `${mediaOrigin}/${objectPath(media)}`

/** The upload scaled down through Cloudflare Image Transformations */
export const transformedMediaUrl = (media: Media, width: number) =>
  `${mediaOrigin}/cdn-cgi/image/width=${width},format=auto/${objectPath(media)}`

/** Every `srcset` width up to the image's own, which is never upscaled */
export function mediaSrcset(media: Media) {
  const widths = media.width
    ? [...srcsetWidths.filter((width) => width < media.width!), media.width]
    : srcsetWidths
  return widths
    .map((width) => `${transformedMediaUrl(media, width)} ${width}w`)
    .join(', ')
}
