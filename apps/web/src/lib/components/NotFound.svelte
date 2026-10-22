<script lang="ts">
  import Icon from '#lib/components/Icon.svelte'
  import SiteHead from '#lib/components/SiteHead.svelte'

  const title = 'Whoops! Page not found'
</script>

<SiteHead {title} />

<!-- frippz.se's 404 page and layout: no header or footer, and `not-found` on the body,
     here on a wrapper that stays out of the body's grid -->
<div class="not-found" style:display="contents">
  <main id="main-content">
    <div class="landmark-content">
      <article aria-labelledby="heading-404">
        <h2 id="heading-404">{title}</h2>
        <Icon icon="icon-cloud" />

        <p>
          Oh my! It seems like the page you were trying to reach could not be
          found. Did you perhaps enter the address incorrectly? No, nobody
          enters addresses by hand anymore, right? People just use Google and
          click on links. In any case, I’m really sorry you didn’t find what you
          were looking for. Perhaps you should try going to <a href="/"
            >the first page of this website</a
          > and see if you can find what you were looking for!
        </p>
      </article>
    </div>
  </main>
</div>
