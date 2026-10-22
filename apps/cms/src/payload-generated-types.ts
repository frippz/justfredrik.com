import type { Config } from 'cms-types'

declare module 'payload' {
  // Merges the generated types into Payload's, so the local API is typed
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface GeneratedTypes extends Config {}
}
