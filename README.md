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

Live Preview on a Post frames the site's `/preview/` page (ADR 0004), so run the site's dev server with `PAYLOAD_URL=http://localhost:3000 pnpm --filter web dev` alongside it. The CMS expects the site on <http://localhost:5173>; set `SITE_URL` (and `SERVER_URL`, for the CMS itself) if either runs elsewhere. Against any CMS but the production one, Figures load from the CMS itself, without `srcset`.

After changing the content model, run `pnpm generate:types` and add a migration with `pnpm --filter cms payload migrate:create <name>`. Deploys apply migrations with `payload migrate`.

## Content

The site reaches content only through `apps/web/src/lib/server/content`. The `CONTENT_SOURCE` environment variable picks the implementation:

- `fixture` (the default): the Posts in `fixture-posts.ts`, which the Playwright tests are written against
- `payload`: Payload's REST API at `PAYLOAD_URL` (default `https://cms.justfredrik.com`), read anonymously, so only published Posts reach the site

To build against a local CMS with the same content as the fixtures, run `pnpm --filter cms seed`. It replaces all Posts, Tags and Media in the local database. Then start the CMS and run:

```sh
CONTENT_SOURCE=payload PAYLOAD_URL=http://localhost:3000 pnpm build
pnpm test
```

The CSS in `apps/web/static/css/` and the SVG sprite are copied verbatim from frippz.se. Don't reformat them.

## Deploy

The CI workflow deploys the site on every push to master and whenever the CMS sends a `content-changed` `repository_dispatch` (ADR 0001). After lint, the CMS tests and the Playwright tests pass, it builds against Payload and runs `wrangler deploy` in `apps/web`, which serves `build/` as Workers static assets. Runs are serialized, and a failed step stops the deploy.

The CMS dispatches when a Post is published, edited and published again, unpublished, or deleted while published. Saving a Draft doesn't. It needs `GITHUB_DISPATCH_TOKEN`, a GitHub token that can send `repository_dispatch` to this repo, as a Worker secret; without it, the CMS logs a warning and doesn't dispatch. The workflow needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` Actions secrets. The Payload build and deploy steps only run when the `DEPLOY_ENABLED` repository variable is `true`; until then, CI stops after the tests.
