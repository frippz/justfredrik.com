import type { Block } from 'payload'

/** Shiki language IDs */
export const languages = [
  'bash',
  'css',
  'html',
  'javascript',
  'json',
  'liquid',
  'markdown',
  'svelte',
  'text',
  'typescript',
  'yaml',
] as const

export const Code: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  fields: [
    {
      name: 'language',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: [...languages],
    },
    {
      name: 'code',
      type: 'code',
      required: true,
    },
  ],
}
