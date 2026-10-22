# justfredrik.com

The blog of Fredrik Frodlund, successor to frippz.se. See `GLOSSARY.md` and `docs/adr/` for the domain language and architecture decisions.

A pnpm workspace on Node 24:

- `apps/web`: the site, a SvelteKit app prerendered to static files with `adapter-static`
- `apps/cms`: the CMS, Payload 3 on Cloudflare Workers with D1 and R2, based on Payload's `with-cloudflare-d1` template
- `packages/cms-types`: the TypeScript types Payload generates from the CMS's content model

## Commands

Run from the repo root:

| Command               | Action                                                       |
| :-------------------- | :----------------------------------------------------------- |
| `pnpm build`          | Build the site to `apps/web/build/`                          |
| `pnpm test`           | Run the Playwright tests against the build                   |
| `pnpm test:cms`       | Run the CMS integration tests against a throwaway local D1   |
| `pnpm generate:types` | Regenerate `packages/cms-types` and the Cloudflare env types |
| `pnpm lint`           | ESLint, Stylelint, Prettier, `svelte-check` and `tsc`        |
| `pnpm format`         | Format everything with Prettier                              |

Start the site's dev server with `pnpm --filter web dev`.

## CMS

To run it locally, put a secret in `apps/cms/.env` (see `.env.example`), then run `pnpm --filter cms dev` and open <http://localhost:3000/admin>. Wrangler emulates D1 and R2 in `apps/cms/.wrangler/`, and Payload pushes schema changes to that database as you go. The first visit asks you to create the admin user.

After changing the content model, run `pnpm generate:types` and add a migration with `pnpm --filter cms payload migrate:create <name>`. Deploys apply migrations with `payload migrate`.

## Content

The site reaches content only through `apps/web/src/lib/server/content`. The `CONTENT_SOURCE` environment variable picks the implementation; `fixture` (the default) is the only one so far.

The CSS in `apps/web/static/css/` and the SVG sprite are copied verbatim from frippz.se. Don't reformat them.
