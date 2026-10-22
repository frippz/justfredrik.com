# justfredrik.com

The blog of Fredrik Frodlund, successor to frippz.se. See `GLOSSARY.md` and `docs/adr/` for the domain language and architecture decisions.

A pnpm workspace on Node 24:

- `apps/web`: the site, a SvelteKit app prerendered to static files with `adapter-static`

## Commands

Run from the repo root:

| Command       | Action                                         |
| :------------ | :--------------------------------------------- |
| `pnpm build`  | Build the site to `apps/web/build/`            |
| `pnpm test`   | Run the Playwright tests against the build     |
| `pnpm lint`   | ESLint, Stylelint, Prettier and `svelte-check` |
| `pnpm format` | Format everything with Prettier                |

Start the dev server with `pnpm --filter web dev`.

## Content

The site reaches content only through `apps/web/src/lib/server/content`. The `CONTENT_SOURCE` environment variable picks the implementation; `fixture` (the default) is the only one so far.

The CSS in `apps/web/static/css/` and the SVG sprite are copied verbatim from frippz.se. Don't reformat them.
