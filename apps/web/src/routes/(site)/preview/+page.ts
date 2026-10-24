import type { PageLoad } from './$types'

// Rendered in the editor's browser from what Payload's Live Preview sends,
// so the build needs no access to Drafts (ADR 0004)
export const ssr = false
export const csr = true

export const load: PageLoad = () => ({ title: 'Preview' })
