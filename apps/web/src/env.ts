import { defineEnvVars } from '@sveltejs/kit/env'

const contentSources = ['fixture', 'payload'] as const

export const variables = defineEnvVars({
  CONTENT_SOURCE: {
    description: `Where the build reads content from: ${contentSources.join(', ')}. Defaults to fixture.`,
    static: true,
    schema: (value) => {
      const source = value || 'fixture'
      if (!contentSources.includes(source as never)) {
        throw new Error(
          `Unknown CONTENT_SOURCE "${source}". Expected one of: ${contentSources.join(', ')}`,
        )
      }
      return source as (typeof contentSources)[number]
    },
  },
  PAYLOAD_URL: {
    description:
      'The Payload CMS the payload content source reads from. Defaults to https://cms.justfredrik.com.',
    static: true,
    schema: (value) => new URL(value || 'https://cms.justfredrik.com').href,
  },
})
