import {
  BoldFeature,
  InlineCodeFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const Figure: Block = {
  slug: 'figure',
  interfaceName: 'FigureBlock',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          ParagraphFeature(),
          BoldFeature(),
          ItalicFeature(),
          InlineCodeFeature(),
          LinkFeature(),
        ],
      }),
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'Makes the image a link to this URL.',
      },
    },
  ],
}
