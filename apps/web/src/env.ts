import { defineEnvVars } from '@sveltejs/kit/env'

const contentSources = ['fixture'] as const

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
})
