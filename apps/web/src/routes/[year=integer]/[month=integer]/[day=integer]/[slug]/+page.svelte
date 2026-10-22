<script lang="ts">
  import Article from '#lib/components/Article.svelte'

  let { data } = $props()
</script>

<Article post={data.post} />
