import type { Block } from 'payload'

/** Raw HTML for the odd demo or table that rich text can't express */
export const Html: Block = {
  slug: 'html',
  interfaceName: 'HtmlBlock',
  labels: { singular: 'HTML', plural: 'HTML' },
  fields: [
    {
      name: 'html',
      type: 'code',
      required: true,
      admin: { language: 'html' },
    },
  ],
}
