<script lang="ts">
  import { html } from '$lib/utils.js';

  export let data;
</script>

<svelte:head>
  <title>{data.post.title}</title>
</svelte:head>

<!-- Post -->
<h1>{data.post.title}</h1>
<article class="post-content" use:html={data.post.content}></article>

<style>
  .post-content {
    max-inline-size: var(--size-content-3);
  }
</style>
