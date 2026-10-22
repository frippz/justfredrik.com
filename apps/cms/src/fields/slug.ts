import type { TextField } from 'payload'

export const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * A unique slug, generated from `fieldToUse` when it's empty. Once set it is
 * only changed by editing it, so a published URL never moves by accident.
 */
export const slugField = (fieldToUse: string): TextField => ({
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: `Generated from the ${fieldToUse} on first save.`,
  },
  hooks: {
    beforeValidate: [
      ({ value, siblingData }) => {
        if (value) return value
        const source: unknown = siblingData[fieldToUse]
        return typeof source === 'string' ? slugify(source) : value
      },
    ],
  },
})
