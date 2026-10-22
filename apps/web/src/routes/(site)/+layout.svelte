<script lang="ts">
  import Icon from '#lib/components/Icon.svelte'
  import SiteHead from '#lib/components/SiteHead.svelte'
  import { externalLinks, feedLinks, site } from '#lib/site'

  let { children } = $props()
</script>

<SiteHead />

<header id="header">
  <div class="landmark-content header-content">
    <h1 class="main-title">
      <a href="/">
        {site.title}
      </a>
    </h1>
    <nav>
      <ul id="main-nav">
        <li><a href="/">Home</a></li>
        <li><a href="/labs/">Labs</a></li>
        <li><a href="/about/">About</a></li>
      </ul>
    </nav>
  </div>
</header>

<main id="main-content">
  <div class="landmark-content">
    {@render children()}
  </div>
</main>

<footer id="footer">
  <div class="landmark-content footer-content">
    <h2 class="offscreen">Find Fredrik in other places</h2>

    <ul class="footer-links external-links">
      {#each externalLinks as item (item.url)}
        <li>
          <a href={item.url} rel="nofollow noopener noreferrer">
            <Icon icon={item.icon} />
            {item.label}
          </a>
        </li>
      {/each}
    </ul>

    <h2 class="offscreen">Subscribe to posts</h2>

    <ul class="footer-links feeds">
      {#each feedLinks as item (item.url)}
        <li>
          <a href={item.url}>
            <Icon icon={item.icon} />
            {item.label}
          </a>
        </li>
      {/each}
    </ul>

    <small class="copyright"
      >© 2005–{new Date().getFullYear()} {site.author}</small
    >
  </div>
</footer>
