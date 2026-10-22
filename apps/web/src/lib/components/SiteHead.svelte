<script lang="ts">
  import { page } from '$app/state'
  import { site } from '#lib/site'

  // Error pages have no page data, so they pass their title
  let { title = page.data.title }: { title?: string } = $props()

  const pageSuffix = $derived(
    (page.data.pageNumber ?? 1) > 1 ? ` (page ${page.data.pageNumber})` : '',
  )
</script>

<!-- The head of every page in the site's style. Labs bring their own. -->
<svelte:head>
  <title>{title} – {site.title}{pageSuffix}</title>
  <link rel="canonical" href="{site.url}{page.url.pathname}" />
  <link
    rel="alternate"
    type="application/feed+json"
    title={site.title}
    href="{site.url}/feed.json"
  />
  <link
    rel="alternate"
    type="application/atom+xml"
    title={site.title}
    href="{site.url}/feed.xml"
  />
  <meta name="author" content={site.author} />
  {#if page.data.description}
    <meta name="description" content="{page.data.description}{pageSuffix}" />
  {/if}
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content={site.twitter} />
  <meta name="twitter:creator" content={site.twitter} />
  <meta name="twitter:title" content="{title} – {site.title}" />
  {#if page.data.description}
    <meta name="twitter:description" content={page.data.description} />
  {/if}
  <meta name="twitter:image" content={site.avatar} />
  <link rel="stylesheet" href="/css/basic.css" />
  <link rel="stylesheet" href="/css/footer.css" />
  <link rel="stylesheet" href="/css/header.css" />
  <link rel="stylesheet" href="/css/layout.css" />
  <link rel="stylesheet" href="/css/main.css" />
  <link rel="stylesheet" href="/css/print.css" media="print" />
  <link rel="stylesheet" href="/css/syntax.css" />
  <link rel="stylesheet" href="/css/variables.css" />
</svelte:head>
