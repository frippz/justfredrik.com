<script lang="ts">
  let { data } = $props()
</script>

<!-- frippz.se's ids, from Jekyll's `slugify` and `slugify: "pretty"` -->
<article aria-labelledby="tags-keywords">
  <h2 id="tags-&-keywords">Tags & keywords</h2>
  <p>
    I honestly don’t care for tag clouds, but the plugin I ended up using didn’t
    support anything else for summarizing all keywords used across all posts.
    Sorry…
  </p>

  <p class="tag-cloud">
    {#each data.tags as tag (tag.path)}
      <!-- eslint-disable-next-line svelte/no-useless-mustaches -- Prettier would drop a bare space -->
      <a href={tag.path} class="set-{tag.set}">{tag.name}</a>{' '}
    {/each}
  </p>
</article>
