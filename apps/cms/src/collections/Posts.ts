import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { Code } from '../blocks/Code'
import { Figure } from '../blocks/Figure'
import { Html } from '../blocks/Html'
import { slugField } from '../fields/slug'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status'],
  },
  access: {
    read: publishedOrAuthenticated,
    readVersions: authenticated,
  },
  defaultSort: '-publishedAt',
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        // Images go in Figure blocks, so the site has one way to render them
        features: ({ defaultFeatures }) => [
          ...defaultFeatures.filter(
            ({ key }) => key !== 'upload' && key !== 'relationship',
          ),
          BlocksFeature({ blocks: [Code, Figure, Html] }),
        ],
      }),
    },
    slugField('title'),
    {
      name: 'publishedAt',
      label: 'Publish date',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Set on first publish. It is part of the URL.',
      },
    },
    {
      name: 'revisedAt',
      label: 'Updated date',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the Post was last revised, for feed readers.',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
