# Static site rebuilt on publish

The site is prerendered with SvelteKit's `adapter-static` and served as Workers static assets; it fetches all published Posts from Payload at build time. Publishing, unpublishing, editing a published Post or deleting one makes Payload send a `repository_dispatch` to GitHub Actions, which rebuilds, tests and deploys the site. We accept a 1–2 minute delay between publishing and going live in exchange for a blog with no runtime dependency on the CMS: if Payload is down, the site stays up.

## Considered Options

- **Server-rendered site on Workers (`adapter-cloudflare`) fetching from Payload per request**: instant publishing and possible live preview, but every page view depends on the CMS being up, and responses need caching. Rejected for now; switching later is cheap because the content model doesn't change.

## Consequences

- There is no live preview of Drafts.
- Published content must be publicly readable through Payload's API so the build needs no secret.
