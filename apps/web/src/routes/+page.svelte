<script lang="ts">
  import Icon from '#lib/components/Icon.svelte'
  import { formatDate, isoDate } from '#lib/format'

  let { data } = $props()
</script>

{#each data.posts as post, i (post.slug)}
  <article id={post.slug} aria-label={post.title}>
    <header>
      <h2 id="heading-{post.slug}">{post.title}</h2>
      <small class="post-info">
        Posted on <time datetime={isoDate(post.publishedAt)}
          >{formatDate(post.publishedAt)}</time
        >
      </small>
    </header>

    <p>{post.description}</p>

    {#if i < data.posts.length - 1}
      <Icon icon="divider" classes="article-end" />
    {/if}
  </article>
{/each}
