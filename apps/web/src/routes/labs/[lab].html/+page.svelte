<script lang="ts">
  import { page } from '$app/state'
  import { labDemoPath } from '#lib/labs'
  import { site } from '#lib/site'

  let { data } = $props()
  const { lab } = $derived(data)
</script>

<!-- frippz.se's `labs` layout: a notebook-style note beside the demo, with no site frame -->
<svelte:head>
  <title>{lab.title} – a lab created by {site.author} – {site.title}</title>
  <link rel="canonical" href="{site.url}{page.url.pathname}" />
  <meta name="description" content={lab.note.join(' ')} />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content={site.twitter} />
  <meta name="twitter:creator" content={site.twitter} />
  <meta name="twitter:title" content="{lab.title} – {site.title}" />
  <meta name="twitter:description" content={lab.note.join(' ')} />
  <meta name="twitter:image" content={site.avatar} />
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Handlee&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<aside>
  <h1>{lab.title}</h1>
  {#each lab.note as paragraph, i (i)}
    <p>{paragraph}</p>
  {/each}
  <p><a href="/labs/">⇠ Back to labs</a></p>
</aside>

<main id="lab-area">
  <iframe src={labDemoPath(lab)} title={lab.title}></iframe>
</main>

<style>
  :global(body) {
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 100vh;
    padding: 0;
    margin: 0;
  }

  aside {
    z-index: 1;
    padding: 1.7em 5.2em;
    margin: -1em;
    font-family: Handlee, cursive;
    font-size: 1.2em;
    line-height: 1.6;
    color: #00006c;
    background-color: #fff;
    background-image:
      linear-gradient(
        90deg,
        transparent 79px,
        #abced4 79px,
        #abced4 81px,
        transparent 81px
      ),
      linear-gradient(#eee 0.1em, transparent 0.1em);
    background-size: 100% 1.6em;
    box-shadow: inset 0 0 0.7em hsl(0deg 0% 0% / 60%);
  }

  aside p {
    max-width: 36ch;
    margin: 0;
  }

  aside p + p {
    margin-top: 1.6em;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
</style>
