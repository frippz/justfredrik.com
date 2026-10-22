import type { CollectionConfig } from 'payload'
import { anyone } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // No image sizes, crop or focal point: they need `sharp`, which can't run
    // on Workers. The site gets its widths from Cloudflare Image Transformations.
    crop: false,
    focalPoint: false,
  },
}
