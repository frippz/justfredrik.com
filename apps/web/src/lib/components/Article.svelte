<script lang="ts">
  import Icon from '#lib/components/Icon.svelte'
  import { formatDate, isoDate } from '#lib/format'
  import { postPath, slugify } from '#lib/posts'
  import type { RenderedPost } from '#lib/body'
  import { site } from '#lib/site'
  import { tagPath } from '#lib/tags'
  import '#lib/styles/line-numbers.css'

  interface Props {
    post: RenderedPost
    /** In a listing, the heading links to the Post's own page */
    linked?: boolean
    /** Ends with frippz.se's divider, for all but the last Post in a listing */
    divider?: boolean
  }

  let { post, linked = false, divider = false }: Props = $props()

  const id = $derived(slugify(post.title))
  const url = $derived(site.url + postPath(post))
</script>

<article
  itemscope
  itemtype="http://schema.org/BlogPosting"
  {id}
  aria-label={post.title}
>
  <header>
    {#if linked}
      <h2 itemprop="headline" id="heading-{id}">
        <a href={postPath(post)} class="article-link">{post.title}</a>
      </h2>
    {:else}
      <h2 itemprop="headline">{post.title}</h2>
    {/if}
    <small class="post-info">
      Posted on <time
        datetime={isoDate(post.publishedAt)}
        itemprop="datePublished">{formatDate(post.publishedAt)}</time
      >
    </small>
    <span
      hidden
      itemprop="publisher"
      itemscope
      itemtype="https://schema.org/Organization"
    >
      <meta itemprop="name" content={site.title} />
      <span
        hidden
        itemprop="logo"
        itemscope
        itemtype="https://schema.org/ImageObject"
      >
        <meta itemprop="url" content="{site.url}/apple-touch-icon.png" />
      </span>
    </span>
    <meta itemprop="author" content={site.author} />
    <meta itemprop="url" content={url} />
    <meta itemprop="image" content={site.avatar} />
    <link itemprop="mainEntityOfPage" href={url} />
    <meta itemprop="description" content={post.description} />
  </header>

  <div itemprop="articleBody">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered at build time from the CMS -->
    {@html post.html}
  </div>

  {#if post.tags.length > 0}
    <footer>
      <p class="post-tags">
        <strong>Keywords:</strong>
        <!-- eslint-disable svelte/no-useless-mustaches -- Prettier would drop a bare space -->
        <span itemprop="keywords"
          >{#each post.tags as tag, i (tag.slug)}{#if i > 0}{', '}{/if}<a
              href={tagPath(tag)}
              rel="tag">{tag.name}</a
            >{/each}</span
        >
        <!-- eslint-enable svelte/no-useless-mustaches -->
      </p>
    </footer>
  {/if}

  {#if divider}
    <Icon icon="divider" classes="article-end" />
  {/if}
</article>
