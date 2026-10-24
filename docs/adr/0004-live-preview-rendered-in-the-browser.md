# Live Preview rendered in the editor's browser

Payload's Live Preview shows a Post beside its editing form, so the site has one page, `/preview/`, that renders client-side from the unsaved Post Payload sends it with `postMessage`, using the same Svelte components and Lexical renderer as the prerendered pages. Its requests to populate Tags and Media go to Payload with the editor's session cookie, so Drafts preview while the API stays closed to anonymous readers. This keeps ADR 0001 intact: the build still needs no secret, and no public page depends on the CMS at runtime.

## Considered Options

- **Server-rendered preview on Workers (`adapter-cloudflare`)**: Payload's server-side mode, which reloads a page that fetches the Draft on each autosave. Rejected because it brings back the runtime dependency and the second rendering mode that ADR 0001 avoids, only for editing.
- **No preview**: rejected; it was a consequence of ADR 0001 rather than a goal, and checking a Post meant publishing it.

## Consequences

- The Lexical renderer must run in the browser as well as at build time, so it lives outside `lib/server`.
- Payload must allow the site's origin in `cors` and `csrf`.
- `/preview/` ships with the static site but is blank unless Payload's admin frames it.
