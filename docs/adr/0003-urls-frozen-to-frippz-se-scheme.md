# URLs frozen to frippz.se's scheme

justfredrik.com keeps every URL path of frippz.se exactly as it was:

- `/:year/:month/:day/:slug/` for Posts
- `/tags/<tag>/`
- `/pageN/`
- `/labs/<name>.html`
- `/feed.xml`, `/feed.json` and `/sitemap.xml`

This lets frippz.se 301-redirect to justfredrik.com with one path-preserving rule, and no existing link, search result or feed item breaks. The date-based paths and the `.html` lab URLs may look dated, but they are a public contract: don't "clean them up" without a full redirect map, and accept that feed readers may show changed items as new.
