<script lang="ts">
  import Article from '#lib/components/Article.svelte'
  import Icon from '#lib/components/Icon.svelte'
  import type { Pagination } from '#lib/posts'

  let { pagination }: { pagination: Pagination } = $props()
</script>

{#each pagination.posts as post, i (post.slug)}
  <Article {post} linked divider={i < pagination.posts.length - 1} />
{/each}

{#if pagination.totalPages > 1}
  <div class="more-articles">
    {#if pagination.olderPath}
      <a href={pagination.olderPath} class="older">
        <Icon icon="arrow-left" />
        Older posts
      </a>
    {/if}
    {#if pagination.newerPath}
      <a href={pagination.newerPath} class="newer">
        Newer posts
        <Icon icon="arrow-right" />
      </a>
    {/if}
  </div>
{/if}
